<script lang="ts">
  import { filteredNodes } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'

  let ol: OpenLayersMap

  $: console.log($filteredNodes.map((v) => [v.position?.latitudeI, v.position?.longitudeI]))

  $: if (ol)
    ol.plotPoints(
      'nodes',
      $filteredNodes
        .filter((n) => n.position?.latitudeI != undefined)
        .map((n) => {
          return {
            lat: n.position.latitudeI / 10000000,
            lon: n.position.longitudeI / 10000000,
            icon: `https://icongaga-api.bytedancer.workers.dev/api/genHexer?name=${n.num}`,
            description: n?.user?.shortName || String(n.num)
          }
        })
    )
</script>

<Card title="Map" {...$$restProps}>
  <OpenLayersMap bind:this={ol} />
</Card>
