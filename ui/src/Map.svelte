<script lang="ts">
  import { myNodeNum, type NodeInfo } from 'api/src/vars'
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'

  let ol: OpenLayersMap

  function getCoordinates(node: NodeInfo | number) {
    if (typeof node == 'number') node = getNodeById(node)
    return [node?.position?.longitudeI / 10000000, node?.position?.latitudeI / 10000000]
  }

  $: pointsWithCoords = $filteredNodes.filter((n) => n.position?.latitudeI != undefined)

  function getNodeById(num: number) {
    return pointsWithCoords.find((n) => n.num == num)
  }

  $: if (ol) {
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

<Card title="Map" {...$$restProps}>
  <OpenLayersMap bind:this={ol} />
</Card>
