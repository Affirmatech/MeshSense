<script lang="ts">
  import axios from 'axios'
  import Meshtastic from './Meshtastic.svelte'
  import ServiceWorker from './ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'

  export const ws = new WebSocketClient(import.meta.env.VITE_API)
  axios.defaults.baseURL = import.meta.env.VITE_API.replace('{{hostname}}', document.location.hostname)
</script>

<main class="w-full grid content-start gap-1 p-2 overflow-auto">
  <ServiceWorker />
  <Meshtastic />
</main>
