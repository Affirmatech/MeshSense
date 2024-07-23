<script lang="ts">
  import { connectionStatus, address, accessKey } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { smallMode } from './Nodes.svelte'
  import { hasAccess } from './lib/util'
    import axios from 'axios'

  let connectionIcons = {
    connected: '🟢',
    connecting: '🟡',
    searching: '🟡',
    disconnected: '🔴'
  }

  function connect() {
    axios.post('/connect', {address: $address})
  }

  function disconnect() {
    axios.post('/disconnect')
  }
</script>

<Card title="Address" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center h-full gap-2">
    <div class="grow">Address</div>
    {#if $connectionStatus == 'connecting'}
      <div class="h-full text-right w-full text-yellow-300 font-normal text-sm mt-1">Connecting</div>
    {:else if $connectionStatus == 'searching'}
      <div class="h-full text-right w-full text-yellow-300 font-normal text-sm mt-1">Searching</div>
    {/if}
  </h2>
  <form on:submit|preventDefault={connect} class="grid {$smallMode ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'} p-2 gap-1 items-center text-sm">
    <div class="flex gap-2 items-center">
      {connectionIcons[$connectionStatus]}
      <input disabled={$connectionStatus != 'disconnected'} size="3" class="input w-full" type="text" bind:value={$address} placeholder="Device IP" />
    </div>
    {#if $hasAccess}
      <div class=" h-full grid grid-flow-col">
        {#if $connectionStatus == 'disconnected'}
          <button class="btn w-full h-full">Connect</button>
        {:else if $connectionStatus == 'connecting'}
          <button class="btn w-full h-full" on:click={disconnect}>Cancel</button>
        {:else if $connectionStatus == 'searching'}
          <button class="btn w-full h-full" on:click={disconnect}>Cancel</button>
        {:else if $connectionStatus == 'connected'}
          <button type="button" class="btn w-full h-full" on:click={disconnect}>Disconnect</button>
        {/if}
      </div>
    {/if}
  </form>
</Card>
