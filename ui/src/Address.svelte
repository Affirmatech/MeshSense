<script lang="ts">
  import { connectionStatus, address, enableTLS, myNodeMetadata, myNodeNum, nodes, lastFromRadio } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { smallMode } from './Nodes.svelte'
  import { hasAccess } from './lib/util'
  import axios from 'axios'

  let connectionIcons = {
    connected: '🟢',
    connecting: '🟡',
    configuring: '🟡',
    searching: '🟡',
    reconnecting: '🟡',
    disconnected: '🔴'
  }

  function connect() {
    axios.post('/connect', { address: $address })
  }

  function disconnect() {
    axios.post('/disconnect')
  }
</script>

<Card title="Address" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center h-full gap-2">
    <div class="grow">Address</div>
    {#if $connectionStatus}
      <div class="h-full text-right w-full text-yellow-300 font-normal text-sm mt-1 capitalize">{$connectionStatus}</div>
    {/if}
  </h2>
  <form on:submit|preventDefault={connect} class="grid {$smallMode ? 'grid-cols-1' : 'grid-cols-[1fr_auto]'} p-2 gap-1 items-center text-sm">
    <!-- Icon and Input -->
    <div class="flex gap-2 items-center">
      {connectionIcons[$connectionStatus]}
      <input disabled={$connectionStatus != 'disconnected'} size="3" class="input w-full" type="text" bind:value={$address} placeholder="Device IP" />
    </div>
    <!-- Cancel Button -->
    {#if $hasAccess}
      {#if $connectionStatus == 'disconnected'}
        <label class="select-none btn cursor-pointer text-center text-sm">
          TLS
          <input type="checkbox" bind:checked={$enableTLS} />
        </label>
        <button class="btn w-full h-full col-span-full saturate-150">Connect</button>
      {:else if $connectionStatus == 'connected'}
        <button type="button" class="btn w-full h-full {$smallMode ? 'col-span-full' : ''}" on:click={disconnect}>Disconnect</button>
      {:else if ['searching', 'connecting', 'configuring', 'reconnecting'].includes($connectionStatus)}
        <button type="button" class="btn w-full h-full" on:click={disconnect}>Cancel</button>
      {/if}
    {/if}
    {#if $myNodeMetadata?.firmwareVersion}
      <div class="grid gap-1 text-xs col-span-2 {$smallMode ? '' : 'grid-cols-2'}">
        <div class="flex gap-2 items-center bg-black/30 rounded">
          <h2 class="rounded">Node #</h2>
          <div class="text-xs">{$myNodeNum}</div>
        </div>
        <div class="flex gap-2 items-center bg-black/30 rounded">
          <h2 class="rounded">FW</h2>
          <div class="text-xs">{$myNodeMetadata?.firmwareVersion}</div>
        </div>
      </div>
    {/if}
  </form>
</Card>
