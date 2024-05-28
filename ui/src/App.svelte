<script context="module" lang="ts">
  import axios from 'axios'
  import Address from './Address.svelte'
  import ServiceWorker from './lib/ServiceWorker.svelte'
  import { WebSocketClient } from './lib/wsc'
  import Channels from './Channels.svelte'
  import Log from './Log.svelte'

  export const ws = new WebSocketClient(import.meta.env.VITE_API)
  axios.defaults.baseURL = import.meta.env.VITE_API.replace('{{hostname}}', document.location.hostname)
</script>

<ServiceWorker />

<main class="w-full grid grid-cols-[auto_1fr] content-start gap-2 p-2 overflow-auto">
  <Address />
  <Channels />
  <Log />
</main>

<style>
</style>
