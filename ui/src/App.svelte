<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  // import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Channels from './Channels.svelte'
  import Log from './Log.svelte'
  import Nodes, { smallMode } from './Nodes.svelte'
  import Map, { expandedMap } from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import Bluetooth from './Bluetooth.svelte'
  import Message from './Message.svelte'
  import { connectionStatus } from 'api/src/vars'
  import UpdateStatus from './lib/UpdateStatus.svelte'

  export const ws = new WebSocketClient(`${import.meta.env.VITE_PATH || ''}/ws`)
  axios.defaults.baseURL = import.meta.env.VITE_PATH
</script>

<script lang="ts">
  let ol: OpenLayersMap
</script>

<!-- <ServiceWorker /> -->

<UpdateStatus />

<main class="w-full grid grid-cols-[auto_1fr] gap-2 p-2 overflow-auto h-full">
  <div class="flex flex-col gap-2 content-start h-full overflow-auto">
    <Address class="shrink-0" />
    <Bluetooth class="shrink-0" />
    <!-- <Channels class="shrink-0" /> -->
    <Nodes {ol} class="grow" />
    <Message />
  </div>
  <div id="content" class="grid grid-rows-[2fr_1fr] content-start h-full overflow-auto gap-2">
    {#if $connectionStatus == 'connected'}
      <Map class={$expandedMap ? 'row-span-full col-span-full' : ''} bind:ol />
    {:else}
      <div class="grid items-center px-5 m-auto">
        <div class="text-3xl font-bold text-white">Welcome to Meshmagic!</div>
        <div class="max-w-md mt-5 flex flex-col gap-4">
          <div>Available bluetooth devices will appear on the left</div>
          <div>If your device is on the network, enter it's IP address in the Device IP field and click Connect</div>
        </div>
      </div>
    {/if}
    {#if !$expandedMap}
      <Log />
    {/if}
  </div>
</main>

<style>
  @media (min-width: 2000px) {
    #content {
      grid-template-rows: repeat(1, minmax(0, 1fr));
      grid-template-columns: 1fr auto;
    }
  }
</style>
