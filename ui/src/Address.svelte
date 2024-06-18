<script lang="ts">
  import { connectionStatus, address } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { smallMode } from './Nodes.svelte'

  let connectionIcons = {
    connected: '🟢',
    connecting: '🟡',
    searching: '🟡',
    disconnected: '🔴'
  }
</script>

<Card title="Address" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="grow">Address</div>
    <button on:click={() => ($smallMode = !$smallMode)} class="btn !px-1 text-sm font-normal">{$smallMode ? '→' : '←'}</button>
  </h2>
  <div class="grid grid-cols-[auto_1fr_auto] p-2 gap-2 items-center text-sm">
    <div>{connectionIcons[$connectionStatus]}</div>
    <div>{$address || '(none)'}</div>
    {#if !$smallMode}
      {#if $connectionStatus == 'disconnected'}
        <button
          class="btn"
          on:click={() => {
            $address = prompt('Enter Node IP to connect to', $address || '')
          }}>Connect</button
        >
      {:else if $connectionStatus == 'connecting'}
        <div>Connecting</div>
      {:else if $connectionStatus == 'searching'}
        <div>Searching</div>
      {:else if $connectionStatus == 'connected'}
        <button class="btn" on:click={() => ($address = '')}>Disconnect</button>
      {/if}
    {/if}
  </div>
</Card>
