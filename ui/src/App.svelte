<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  // import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Log from './Log.svelte'
  import Nodes, { smallMode } from './Nodes.svelte'
  import Map, { expandedMap } from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import Bluetooth from './Bluetooth.svelte'
  import Message from './Message.svelte'
  import { allowRemoteMessaging, connectionStatus, version } from 'api/src/vars'
  import UpdateStatus from './lib/UpdateStatus.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import { hasAccess } from './lib/util'
  import News, { newsVisible } from './News.svelte'

  export const ws = new WebSocketClient(`${import.meta.env.VITE_PATH || ''}/ws`)
  axios.defaults.baseURL = import.meta.env.VITE_PATH
</script>

<script lang="ts">
  let ol: OpenLayersMap

  import { onMount } from 'svelte'
  import { showPage } from './SettingsModal.svelte'

  onMount(() => {
     window.api?.onOpenSettings(() => {
       showPage('Settings')
     })
   })
</script>

<!-- <ServiceWorker /> -->
<UpdateStatus />
<SettingsModal />

<main class="w-full grid grid-cols-[auto_1fr] gap-2 p-2 overflow-auto h-full">
  <News />
  <div class="flex flex-col gap-2 content-start h-full overflow-auto">
    {#if $hasAccess}
      <Address class="shrink-0" />
    {/if}
    <Bluetooth class="shrink-0" />
    <!-- <Channels class="shrink-0" /> -->
    <Nodes {ol} class="grow" />
    {#if window.location.hostname == 'localhost' || $hasAccess || $allowRemoteMessaging}
      <Message />
    {/if}
  </div>
  <div id="content" class="grid grid-rows-[5fr_3fr] content-start h-full overflow-auto gap-2 relative">
    {#if $connectionStatus == 'connected'}
      <Map class={$expandedMap ? 'row-span-full col-span-full' : ''} bind:ol />
    {:else}
      <div class="grid items-center px-5 m-auto">
        <div class="text-3xl font-bold text-white">Welcome to MeshSense!</div>
        <div class="max-w-md mt-5 flex flex-col gap-4">
          <div>Available bluetooth devices will appear on the left</div>
          <div>If your device is on the network, enter it's IP address in the Device IP field and click Connect.</div>

          {#if !$hasAccess}
            <div>If you do not see the option to connect, you can get access by connecting via localhost or by setting your Access and User key.</div>
          {/if}

          <div>
            For additional information, take a look at our <a target="_blank" href="https://affirmatech.com/meshsense/faq">FAQ</a> and
            <a target="_blank" href="https://affirmatech.com/meshsense/bluetooth">Bluetooth Tips</a>
          </div>
        </div>
        <div class="font-normal absolute m-2 top-0 right-0 flex gap-2 items-center">
          <div class="text-xs text-white/50 pr-2 font-bold">MeshSense {$version}</div>
          <button class="btn btn-sm h-6 grid place-content-center" on:click={() => newsVisible.set(true)}>📰</button>
          <button class="btn btn-sm h-6 grid place-content-center" on:click={() => showPage('Settings')}>⚙</button>
        </div>
      </div>
    {/if}
    {#if !$expandedMap}
      <Log {ol} />
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
