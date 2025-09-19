<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  // import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Log from './Log.svelte'
  import Nodes, { smallMode, focusNodeFilter } from './Nodes.svelte'
  import Map, { expandedMap } from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import Bluetooth from './Bluetooth.svelte'
  import Message from './Message.svelte'
  import { allowRemoteMessaging, connectionStatus, version } from 'api/src/vars'
  import UpdateStatus from './lib/UpdateStatus.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import { isElectron, hasAccess } from './lib/util'
  import News, { newsVisible } from './News.svelte'
  import CustomTitleBar from './lib/CustomTitleBar.svelte'
  import ButtonBar from './lib/ButtonBar.svelte'
  import Welcome from './Welcome.svelte'

  export const ws = new WebSocketClient(`${import.meta.env.VITE_PATH || ''}/ws`)
  axios.defaults.baseURL = import.meta.env.VITE_PATH
</script>

<script lang="ts">
  let ol: OpenLayersMap

  import { onMount } from 'svelte'
  import { showPage } from './SettingsModal.svelte'

  onMount(() => {
    if (window.api?.onOpenSettings) {
      window.api.onOpenSettings(() => {
        showPage('Settings')
      })
    }

    if (window.api?.onFocusNodeFilter) {
      window.api.onFocusNodeFilter(() => {
        focusNodeFilter()
      })
    }
  })
</script>

<!-- <ServiceWorker /> -->
<UpdateStatus />
<SettingsModal />

{#if isElectron}
  <CustomTitleBar title="MeshSense" />
{/if}

<main class="w-full grid grid-cols-[auto_1fr] gap-2 p-2 {isElectron && 'pt-10'} overflow-auto h-full">
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
      <Welcome />
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
