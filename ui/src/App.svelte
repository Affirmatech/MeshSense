<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Channels from './Channels.svelte'
  import Log from './Log.svelte'
  import Nodes from './Nodes.svelte'
  import Map from './Map.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'

  export const ws = new WebSocketClient(import.meta.env.VITE_API)
  axios.defaults.baseURL = import.meta.env.VITE_API.replace('{{hostname}}', document.location.hostname)
</script>

<script lang="ts">
  let ol: OpenLayersMap
</script>

<ServiceWorker />

<main class="layout w-full grid content-start gap-2 p-2 overflow-auto h-full">
  <Address style="grid-area: address;" />
  <Channels style="grid-area: channels;" />
  <Nodes {ol} style="grid-area: nodes;" />
  <Log style="grid-area: log;" />
  <Map bind:ol style="grid-area: map;" />
</main>

<style>
  .layout {
    grid-template-areas:
      'address channels'
      'nodes log'
      'nodes map';
    grid-template-rows: auto 1fr 2fr;
    grid-template-columns: auto 1fr;
  }
</style>
