<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  // import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Log from './Log.svelte'
  import UserMessages from './UserMessages.svelte'
  import Nodes, { smallMode, focusNodeFilter } from './Nodes.svelte'
  import Map, { expandedMap } from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import Bluetooth from './Bluetooth.svelte'
  import Message from './Message.svelte'
  import { allowRemoteMessaging, connectionStatus, version, packets } from 'api/src/vars'
  import UpdateStatus from './lib/UpdateStatus.svelte'
  import SettingsModal from './SettingsModal.svelte'
  import { hasAccess } from './lib/util'
  import News, { newsVisible } from './News.svelte'
  import { messages } from './lib/messageStore'

  export const ws = new WebSocketClient(`${import.meta.env.VITE_PATH || ''}/ws`)
  axios.defaults.baseURL = import.meta.env.VITE_PATH
</script>

<script lang="ts">
  let ol: OpenLayersMap
  let activeTab: 'messages' | 'log' = 'messages'

  import { onMount } from 'svelte'
  import { showPage } from './SettingsModal.svelte'

  onMount(() => {
    // Fetch initial message history from the server
    axios.get('/messages').then(response => {
        messages.set(response.data.sort((a, b) => a.rxTime - b.rxTime));
    }).catch(error => {
        console.error("Failed to fetch message history:", error);
    });

    const handleNewPacket = (packet) => {
      if (packet?.message) {
        messages.update(msgs => {
          if (!msgs.some(m => m.id === packet.id)) {
            // Add new message and re-sort
            return [...msgs, packet].sort((a, b) => a.rxTime - b.rxTime);
          }
          return msgs; // Return existing messages if it's a duplicate
        });
      }
    };

    // Listen for new packets coming in via websocket
    const offPush = packets.on('push', handleNewPacket);
    const offUpsert = packets.on('upsert', handleNewPacket);

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

    // Cleanup listeners on component destroy
    return () => {
      offPush();
      offUpsert();
    };
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
      <div class="flex flex-col h-full bg-gray-800 rounded-lg">
        <div class="flex-shrink-0 border-b border-gray-700">
          <button class="px-4 py-2 text-sm" class:font-bold={activeTab === 'messages'} class:text-white={activeTab === 'messages'} class:text-gray-400={activeTab !== 'messages'} on:click={() => activeTab = 'messages'}>Messages</button>
          <button class="px-4 py-2 text-sm" class:font-bold={activeTab === 'log'} class:text-white={activeTab === 'log'} class:text-gray-400={activeTab !== 'log'} on:click={() => activeTab = 'log'}>Log</button>
        </div>
        <div class="flex-grow h-full overflow-y-auto">
          {#if activeTab === 'messages'}
            <UserMessages />
          {:else}
            <Log {ol} />
          {/if}
        </div>
      </div>
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
