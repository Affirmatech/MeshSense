<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
</script>

<script lang="ts">
  import { connectionStatus, myNodeNum, version, type NodeInfo } from 'api/src/vars'
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates } from './lib/util'
  import { showConfigModal, showPage } from './SettingsModal.svelte'

  export let ol: OpenLayersMap = undefined

  $: pointsWithCoords = $filteredNodes.filter((n) => !(n.position?.latitudeI == undefined || n.position?.latitudeI == 0))

  $: if (ol) {
    let myNodeCoords = getCoordinates($myNodeNum)

    ol.plotLines(
      'routes',
      pointsWithCoords
        .filter((n) => n.trace || n.hopsAway == 0)
        .map((n) => {
          let list = [myNodeCoords, ...(n.trace?.route?.map((n) => getCoordinates(n)) || []), getCoordinates(n)]
          return list.filter((coords) => !(coords[0] == 0 && coords[1] == 0))
        })
    )

    ol.plotPoints(
      'nodes',
      pointsWithCoords.map((n) => {
        let [lon, lat] = getCoordinates(n)
        return {
          lat,
          lon,
          icon: `https://icongaga-api.bytedancer.workers.dev/api/genHexer?name=${n.num}`,
          description: n?.user?.shortName || String(n.num)
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
    <a title="Support MeshSense" target="_blank" rel="noopener" class="!text-rose-400 font-bold btn text-sm hover:text-white" href="https://purchase.affirmatech.com/?productId=MeshSenseDonation">♥</a
    >
    <button class="btn btn-sm h-6 font-normal grid place-content-center" on:click={() => showPage('Settings')}>⚙</button>
  </h2>
  <OpenLayersMap bind:this={ol} center={getCoordinates($myNodeNum)} />
</Card>
