<script context="module" lang="ts">
  import axios from 'axios'
  import Meshtastic from './Meshtastic.svelte'
  import ServiceWorker from './ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Channels from './Channels.svelte'
  import Log from './Log.svelte'

  export const ws = new WebSocketClient(import.meta.env.VITE_API)
  axios.defaults.baseURL = import.meta.env.VITE_API.replace('{{hostname}}', document.location.hostname)
</script>

<main class="w-full grid grid-cols-2 content-start items-stretch gap-2 p-2 overflow-auto">
  <ServiceWorker />
  <Meshtastic />
  <Channels />
  <Log />
</main>
