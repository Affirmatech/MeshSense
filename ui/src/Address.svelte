<script lang="ts">
  import { connectionStatus, address } from 'api/src/vars'
  import Card from './lib/Card.svelte'

  let connectionIcons = {
    connected: '🟢',
    connecting: '🟡',
    disconnected: '🔴'
  }
</script>

<Card title="Address" {...$$restProps}>
  <div class="grid grid-cols-[auto_1fr_auto] p-2 gap-2 items-center">
    <div>{connectionIcons[$connectionStatus]}</div>
    <div>{$address || '(none)'}</div>
    {#if $connectionStatus == 'disconnected'}
      <button
        class="btn"
        on:click={() => {
          $address = prompt('Enter Node IP to connect to', $address || '')
        }}>Connect</button
      >
    {:else if $connectionStatus == 'connecting'}
      <div>Connecting</div>
    {:else if $connectionStatus == 'connected'}
      <button class="btn" on:click={() => ($address = '')}>Disconnect</button>
    {/if}
  </div>
</Card>
