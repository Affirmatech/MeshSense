<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
  export let setPositionMode = writable(false)
  import { generateHexer } from '@bdancer/icon-gaga'

  export function getSvgUri(name: string) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(generateHexer({ name }))
  }

  export function getIconURL(node: NodeInfo) {
    if (node.position?.latitudeI) {
      if (node?.position?.altitude > 2743) return `${import.meta.env.VITE_PATH || ''}/airplane.svg`
      else return getSvgUri(String(node.num))
      // else return `https://icongaga-api.bytedancer.workers.dev/api/genHexer?name=${node.num}`
    } else {
      return `${import.meta.env.VITE_PATH || ''}/circle-help.svg`
    }
  }
</script>

<script lang="ts">
  import { connectionStatus, myNodeNum, version, type NodeInfo } from 'api/src/vars'
  import { filteredNodes, isInactive, nodeVisibilityMode } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates, getNodeById, getNodeName, getNodeNameById, setPosition } from './lib/util'
  import { showConfigModal, showPage } from './SettingsModal.svelte'
  import { newsVisible } from './News.svelte'
  import { fromLonLat } from 'ol/proj'
  import { getNodeHistory, type HistoryRecord } from './stores/nodes';
  import { selectedHistoryNode, showHistoryPanel } from './stores/ui';

  export let ol: any; // or use the correct type if you have one

  $: nodesWithCoords = $filteredNodes.filter((n) => !(n.position?.latitudeI == undefined || n.position?.latitudeI == 0) || n.approximatePosition)

  function plotData() {
    let myNodeCoords = getCoordinates($myNodeNum)

    ol.plotLines(
      'routes',
      nodesWithCoords
        .filter((n) => (n.trace || n.hopsAway == 0) && $nodeVisibilityMode != 'inactive' && !n.trace?.route?.some((routeNodeId) => isInactive(getNodeById(routeNodeId))))
        .map((n) => {
          let list: any[] = [...(n.trace?.route?.map((traceNode) => getCoordinates(traceNode)) || []), getCoordinates(n)]
          if (myNodeCoords[0] && myNodeCoords[1]) list.unshift(myNodeCoords)
          return list.filter((coords) => !(coords[0] == 0 && coords[1] == 0))
        })
    )

    ol.plotPoints(
      'nodes',
      nodesWithCoords.map((n) => {
        let [lon, lat] = getCoordinates(n)
        return {
          lat,
          lon,
          icon: getIconURL(n),
          description: getNodeName(n)
        }
      })
    )
  }

  $: {
    $myNodeNum, nodesWithCoords
    if (ol) {
      plotData()
    }
  }

  let modalPage = 'Settings'

  let trailArray: { coords: [number, number]; ts: number }[] = [];
  let pendingTrail = false;
  let timeWindowMs = 6 * 3600 * 1000; // default 6 hours
  let rangeStart: number | null = null;
  let rangeEnd: number | null = null;

  function pruneOldPoints() {
    const cutoff = Date.now() - timeWindowMs;
    console.log('→ Pruning old points; cutoff =', new Date(cutoff).toLocaleString());
    console.log('   before prune:', trailArray.length);
    trailArray = trailArray.filter(p => p.ts >= cutoff);
    console.log('   after prune:', trailArray.length);
  }

  function scheduleTrailUpdate() {
    if (pendingTrail) return;
    pendingTrail = true;

    requestAnimationFrame(() => {
      const coordsTransformed = trailArray.map(p => fromLonLat(p.coords));
      console.log('→ scheduleTrailUpdate called, trailArray length =', trailArray.length);
      console.log('   transformed coords:', coordsTransformed);
      ol?.plotTrail(coordsTransformed);
      pendingTrail = false;
    });
  }

  $: if (ol) {
    ol.plotTrail([])
    // ...existing plotData() or other init calls...
  }

  $: {
    // Whenever the selected node or its coords change…
    const selectedNode = nodesWithCoords.find(n => n.num === $myNodeNum)
    if (selectedNode?.position?.latitudeI && selectedNode?.position?.longitudeI) {
      const lon = selectedNode.position.longitudeI / 1e7
      const lat = selectedNode.position.latitudeI / 1e7

      // Only push if it’s truly new
      const last = trailArray[trailArray.length - 1]
      if (!last || last.coords[0] !== lon || last.coords[1] !== lat) {
        trailArray.push({ coords: [lon, lat], ts: Date.now() })
        pruneOldPoints()
        scheduleTrailUpdate()
      }
    }
  }

  async function onTimestampClick(entry: any) {
    if (rangeStart === null || (rangeStart !== null && rangeEnd !== null)) {
      rangeStart = entry.timestampMs;
      rangeEnd = null;
      trailArray = [];
      scheduleTrailUpdate();
    } else if (rangeEnd === null) {
      rangeEnd = entry.timestampMs;
      applyHistoryRange();
    }
  }

  async function applyHistoryRange() {
    if (!$selectedHistoryNode || rangeStart === null || rangeEnd === null) return;
    const historyRecords: HistoryRecord[] = await getNodeHistory($selectedHistoryNode);
    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);
    const points = historyRecords
      .map(r => ({
        coords: [r.longitudeI / 1e7, r.latitudeI / 1e7] as [number, number],
        ts: r.timestampMs
      }))
      .filter(p => p.ts >= start && p.ts <= end)
      .sort((a, b) => a.ts - b.ts);
    const uniquePoints = points.filter((p, i, arr) => {
      if (i === 0) return true;
      const [prevLon, prevLat] = arr[i - 1].coords;
      return p.coords[0] !== prevLon || p.coords[1] !== prevLat;
    });
    trailArray = uniquePoints;
    scheduleTrailUpdate();
  }

  function resetHistoryRange() {
    rangeStart = rangeEnd = null;
    trailArray = [];
    scheduleTrailUpdate();
  }

  let historyList: any[] = [];

  $: if ($selectedHistoryNode && $showHistoryPanel) {
    getNodeHistory($selectedHistoryNode).then(list => historyList = list);
  }
</script>

<Card title="Map" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center gap-1">
    <div class="mr-2">Map</div>

    <div class="grow">
      <button on:click={() => ($expandedMap = !$expandedMap)} class="btn font-normal text-xs">{$expandedMap ? 'Collapse' : 'Expand'}</button>
    </div>
    <div class="text-xs text-white/50 pr-2">MeshSense {$version}</div>
    <a href="https://affirmatech.com" target="_blank" rel="noopener" class="text-xs text-white/50 pr-2 font-normal">by Affirmatech</a>
    <a title="Support MeshSense" target="_blank" rel="noopener" class="!text-rose-400 font-bold btn text-sm hover:brightness-110" href="https://purchase.affirmatech.com/?productId=MeshSenseDonation"
      >♥</a
    >
    <button title="What's New?" class="btn btn-sm h-6 grid place-content-center" on:click={() => newsVisible.set(true)}>📰</button>
    <a title="MeshSense Global Map" target="_blank" rel="noopener" class="font-bold btn text-sm hover:brightness-110" href="https://meshsense.affirmatech.com/">🌎</a>
    <button title="Settings" class="btn btn-sm h-6 font-normal grid place-content-center" on:click={() => showPage('Settings')}>⚙</button>
  </h2>
  <OpenLayersMap
    bind:this={ol}
    center={JSON.parse(localStorage.getItem('mapCenter')) ?? getCoordinates($myNodeNum)}
    zoom={JSON.parse(localStorage.getItem('mapZoom'))}
    onMove={(center, zoom) => {
      localStorage.setItem('mapCenter', JSON.stringify(center))
      localStorage.setItem('mapZoom', JSON.stringify(zoom))
    }}
    onClick={(latitude, longitude) => {
      if ($setPositionMode) {
        $setPositionMode = false
        setPosition(latitude, longitude)
      }
    }}
    onDarkModeToggle={plotData}
  />
  {#if $setPositionMode}
    <div class="absolute select-none top-10 left-10 bg-indigo-600/80 text-white p-3 py-1 rounded-lg">
      Click on a new position for {getNodeNameById($myNodeNum)}
      <button title="Cancel selecting a position" class="btn btn-sm ml-2 font-bold !text-red-200 !from-rose-500 !to-rose-800 rounded-full" on:click={() => ($setPositionMode = false)}>X</button>
    </div>
  {/if}

  {#if $showHistoryPanel}
    <section class="node-history">
      <h3>Node History for #{$selectedHistoryNode}</h3>
      <p class="text-sm mb-2">Select start and end timestamps to draw a trail.</p>
      {#if historyList.length === 0}
        <p><em>No history available for this node.</em></p>
      {:else}
        {#each historyList as entry (entry.timestampMs)}
          <button
            type="button"
            class="timestamp-item {rangeStart === entry.timestampMs || rangeEnd === entry.timestampMs ? 'bg-indigo-500 text-white' : ''}"
            on:click={() => onTimestampClick(entry)}>
            {new Date(entry.timestampMs).toLocaleString()}
          </button>
        {/each}
      {/if}
      <div class="mt-2 flex gap-2">
        <button class="btn" on:click={resetHistoryRange}>Clear Selection</button>
        <button class="btn" on:click={() => { resetHistoryRange(); showHistoryPanel.set(false); }}>Close</button>
      </div>
    </section>
  {/if}
</Card>
