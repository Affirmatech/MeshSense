<script lang="ts">
  import { connectionStatus, myNodeNum, type NodeInfo } from 'api/src/vars'
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates } from './lib/util'

  export let ol: OpenLayersMap = undefined

  $: pointsWithCoords = $filteredNodes.filter((n) => n.position?.latitudeI != undefined)

  $: if (ol && $connectionStatus == 'connected') {
    let myNodeCoords = getCoordinates($myNodeNum)

    ol.plotLines(
      'routes',
      pointsWithCoords
        .filter((n) => n.trace)
        .map((n) => {
          return [myNodeCoords, ...n.trace.route.map((n) => getCoordinates(n)), getCoordinates(n)]
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
    <OpenLayersMap bind:this={ol} center={getCoordinates($myNodeNum)} />
  </Card>
{/if}
