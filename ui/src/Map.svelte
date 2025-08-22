<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
  export let setPositionMode = writable(false)
  import { generateHexer } from '@bdancer/icon-gaga'

  export function getSvgUri(name: string) {
    const hexId = parseInt(name).toString(16).padStart(8, '0')
    const colorId = hexId.slice(-6)
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(generateHexer({
      name,
      borderColor: `#${colorId}`
    }))
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
  import { connectionStatus, myNodeNum, type NodeInfo } from 'api/src/vars'
  import { filteredNodes, isInactive, nodeVisibilityMode } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { isElectron, getCoordinates, getNodeById, getNodeName, getNodeNameById, setPosition } from './lib/util'
  import { showConfigModal, showPage } from './SettingsModal.svelte'
  import { newsVisible } from './News.svelte'
  import ButtonBar from './lib/ButtonBar.svelte'

  export let ol: OpenLayersMap = undefined

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
</script>

<Card title="Map" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="mr-2">Map</div>
    <div class="flex-1 flex justify-end">
      {#if !isElectron}
        <ButtonBar />
      {/if}
    </div>
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
  ></OpenLayersMap>
  {#if $setPositionMode}
    <div class="absolute select-none top-10 left-10 bg-indigo-600/80 text-white p-3 py-1 rounded-lg">
      Click on a new position for {getNodeNameById($myNodeNum)}
      <button title="Cancel selecting a position" class="btn btn-sm ml-2 font-bold !text-red-200 !from-rose-500 !to-rose-800 rounded-full" on:click={() => ($setPositionMode = false)}>X</button>
    </div>
  {/if}
</Card>
