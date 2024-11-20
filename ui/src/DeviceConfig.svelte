<script lang="ts">
  import axios from 'axios'
  import { onDestroy, onMount } from 'svelte'
  import { userKey } from './lib/util'

  let deviceConfig = {}
  let keys = []
  let selectedKey = 'device'

  async function getConfig() {
    try {
      deviceConfig = (await axios.get('/deviceConfig', { params: { accessKey: $userKey } })).data
      keys = Object.keys(deviceConfig).sort()
    } catch (e) {
      console.error(e)
    }
  }

  onMount(getConfig)
  let refreshInterval = setInterval(getConfig, 2000)
  onDestroy(() => clearInterval(refreshInterval))
</script>

<div class="grid grid-cols-[auto_1fr] gap-1">
  <div class="flex flex-col gap-1 overflow-auto h-80 p-0.5 pr-1">
    {#each keys as key}
      <button class:grayscale={key != selectedKey} class="btn w-36 text-sm" on:click={() => (selectedKey = key)}>{key}</button>
    {/each}
  </div>
  <pre class="overflow-auto h-80 rounded ring bg-black/20 p-2 m-1 grow">{JSON.stringify(deviceConfig?.[selectedKey], undefined, 2) ?? ''}</pre>
</div>
