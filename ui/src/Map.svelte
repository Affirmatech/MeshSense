<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
  export let setPositionMode = writable(false)
</script>

<script lang="ts">
  import { connectionStatus, myNodeNum, version, type NodeInfo } from 'api/src/vars'
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates, getNodeName, getNodeNameById, setPosition } from './lib/util'
  import { showConfigModal, showPage } from './SettingsModal.svelte'
  import { newsVisible } from './News.svelte'

  export let ol: OpenLayersMap = undefined

  $: nodesWithCoords = $filteredNodes.filter((n) => !(n.position?.latitudeI == undefined || n.position?.latitudeI == 0) || n.approximatePosition)

  function getIconURL(node: NodeInfo) {
    if (node.position?.latitudeI) {
      if (node?.position?.altitude > 2743) return `${import.meta.env.VITE_PATH || ''}/airplane.svg`
      else return `https://icongaga-api.bytedancer.workers.dev/api/genHexer?name=${node.num}`
    } else {
      return `${import.meta.env.VITE_PATH || ''}/circle-help.svg`
    }
  }

  $: if (ol) {
    let myNodeCoords = getCoordinates($myNodeNum)

    ol.plotLines(
      'routes',
      nodesWithCoords
        .filter((n) => n.trace || n.hopsAway == 0)
        .map((n) => {
          let list = [myNodeCoords, ...(n.trace?.route?.map((n) => getCoordinates(n)) || []), getCoordinates(n)]
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

  let modalPage = 'Settings'
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
  ></OpenLayersMap>
  {#if $setPositionMode}
    <div class="absolute select-none top-10 left-10 bg-indigo-600/80 text-white p-3 py-1 rounded-lg">
      Click on a new position for {getNodeNameById($myNodeNum)}
      <button title="Cancel selecting a position" class="btn btn-sm ml-2 font-bold !text-red-200 !from-rose-500 !to-rose-800 rounded-full" on:click={() => ($setPositionMode = false)}>X</button>
    </div>
  {/if}
</Card>
