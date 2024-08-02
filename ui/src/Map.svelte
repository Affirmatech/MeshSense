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
  import Modal from './lib/Modal.svelte'
  import { license } from './gpl3'

  export let ol: OpenLayersMap = undefined
  let showConfigModal = false

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

  let modalPage = 'Settings'
</script>

<Modal title="Meshmagic" bind:visible={showConfigModal}>
  <div class="grid grid-rows-[auto_1fr] gap-2">
    <!-- Sidebar -->
    <div class="flex gap-1">
      {#each ['Settings', 'Terms of Service'] as category}
        <button on:click={() => (modalPage = category)} class="btn btn-sm h-8 w-32 {modalPage == category ? 'brightness-125' : 'grayscale'}">{category}</button>
      {/each}
    </div>

    <!-- Content -->
    <div class="p-2">
      {#if modalPage == 'Settings'}
        Settings
      {:else if modalPage == 'Terms of Service'}
        <div class="flex flex-col gap-4">
          <div class="font-bold">Usage Warranty</div>
          <div class="font-mono">Affirmatech, Inc. disclaims all liability for damages (consequential and otherwise) arising from the use of this product. No other warranty is given.</div>
          <div class="font-bold">Meshmagic uses the Meshtastic Javascript library which is licensed under GPL-3 as follows:</div>
          <pre class="overflow-auto h-80 rounded ring bg-black/20 mr-10 p-4">{license}</pre>
          <div>For requests related to the GPL, please <a href="https://affirmatech.com/contact?product=Meshmagic">contact us</a> and we will accomodate your request.</div>
        </div>
      {/if}
    </div>
  </div>
</Modal>

<Card title="Map" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center gap-1">
    <div class="mr-2">Map</div>

    <div class="grow">
      <button on:click={() => ($expandedMap = !$expandedMap)} class="btn font-normal text-xs">{$expandedMap ? 'Collapse' : 'Expand'}</button>
    </div>
    <div class="text-xs text-white/50 pr-2">Meshmagic {$version}</div>
    <a href="https://affirmatech.com" target="_blank" rel="noopener" class="text-xs text-white/50 pr-2 font-normal">by Affirmatech</a>
    <a title="Support Meshmagic" target="_blank" rel="noopener" class="!text-rose-400 font-bold btn text-sm hover:text-white" href="https://purchase.affirmatech.com/?productId=MeshmagicDonation">♥</a
    >
    <button class="btn btn-sm h-6 font-normal grid place-content-center" on:click={() => (showConfigModal = true)}>⚙</button>
  </h2>
  <OpenLayersMap bind:this={ol} center={getCoordinates($myNodeNum)} />
</Card>
