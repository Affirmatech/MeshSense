<script lang="ts">
  import { connectionStatus, address, accessKey } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { smallMode } from './Nodes.svelte'
  import { hasAccess } from './lib/util'

  let connectionIcons = {
    connected: '🟢',
    connecting: '🟡',
    searching: '🟡',
    disconnected: '🔴'
  }

  $: inputAddress = $address

  function connect() {
    $address = inputAddress
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
      <input disabled={$connectionStatus != 'disconnected'} size="3" class="input w-full" type="text" bind:value={inputAddress} placeholder="Device IP" />
    </div>
    {#if $hasAccess}
      <div class=" h-full grid grid-flow-col">
        {#if $connectionStatus == 'disconnected'}
          <button class="btn w-full h-full">Connect</button>
          <!-- {:else if $connectionStatus == 'connecting'} -->
          <!-- <button class="btn w-full h-full" on:click={() => ($address = '')}>Cancel</button> -->
        {:else if $connectionStatus == 'searching'}
          <button class="btn w-full h-full" on:click={() => ($address = '')}>Cancel</button>
        {:else if $connectionStatus == 'connected'}
          <button type="button" class="btn w-full h-full" on:click={() => ($address = '')}>Disconnect</button>
        {/if}
      </div>
    {/if}
  </form>
</Card>
