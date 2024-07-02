<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
</script>

<script lang="ts">
  import { connectionStatus, myNodeNum, type NodeInfo } from 'api/src/vars'
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates } from './lib/util'

  export let ol: OpenLayersMap = undefined

  $: pointsWithCoords = $filteredNodes.filter((n) => !(n.position?.latitudeI == undefined || n.position?.latitudeI == 0))

  $: if (ol) {
    let myNodeCoords = getCoordinates($myNodeNum)

    ol.plotLines(
      'routes',
      pointsWithCoords
        .filter((n) => n.trace || n.hopsAway == 0)
        .map((n) => {
          return [myNodeCoords, ...(n.trace?.route?.map((n) => getCoordinates(n)) || []), getCoordinates(n)]
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
</script>

{#if $connectionStatus == 'connected'}
  <Card title="Map" {...$$restProps}>
    <h2 slot="title" class="rounded-t flex">
      <div class="gap-2 grow">Map</div>
      <button on:click={() => ($expandedMap = !$expandedMap)} class="btn text-sm font-normal">{$expandedMap ? 'Collapse' : 'Expand'}</button>
    </h2>
    <OpenLayersMap bind:this={ol} center={getCoordinates($myNodeNum)} />
  </Card>
{/if}
