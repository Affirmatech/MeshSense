<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Channels from './Channels.svelte'
  import Log from './Log.svelte'
  import Nodes, { smallMode } from './Nodes.svelte'
  import Map from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import Bluetooth from './Bluetooth.svelte'
  import Message from './Message.svelte'

  export const ws = new WebSocketClient(`${import.meta.env.VITE_PATH || ''}/ws`)
  axios.defaults.baseURL = import.meta.env.VITE_PATH
</script>

<script lang="ts">
  let ol: OpenLayersMap
</script>

<ServiceWorker />

<main class="w-full grid grid-cols-[auto_1fr] gap-2 p-2 overflow-auto h-full">
  <div class="flex flex-col gap-2 content-start h-full overflow-auto">
    <Address class="shrink-0" />
    <Bluetooth class="shrink-0" />
    <!-- <Channels class="shrink-0" /> -->
    <Nodes {ol} class="grow" />
    <Message />
  </div>
  <div class="grid grid-rows-[2fr_1fr] 2xl:grid-rows-1 2xl:grid-cols-[1fr_1fr] content-start h-full overflow-auto gap-2">
    <Map bind:ol />
    <Log />
  </div>
</main>
