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
</script>

<Card title="Address" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="grow">Address</div>
  </h2>
  <div class="grid {$smallMode ? 'grid-cols-1' : 'grid-cols-2'} p-2 gap-2 items-center text-sm">
    <div class="flex gap-2">
      {connectionIcons[$connectionStatus]}
      <div>{$address || '(none)'}</div>
    </div>
    <div>
      {#if $connectionStatus == 'disconnected'}
        <button
          class="btn w-full"
          on:click={() => {
            $address = prompt('Enter Node IP to connect to', $address || '')
          }}>Connect</button
        >
      {:else if $connectionStatus == 'connecting'}
        <div class="text-center w-full text-yellow-300">Connecting</div>
      {:else if $connectionStatus == 'searching'}
        <button class="btn w-full" on:click={() => ($address = '')}>Cancel Connect</button>
      {:else if $connectionStatus == 'connected'}
        {#if $hasAccess}
          <button class="btn w-full" on:click={() => ($address = '')}>Disconnect</button>
        {/if}
      {/if}
    </div>
  </div>
</Card>
