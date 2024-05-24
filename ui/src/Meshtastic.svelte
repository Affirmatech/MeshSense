<script lang="ts">
  import { State } from 'api/src/lib/state'

  export let address = new State('address', '')
  export let connectionStatus = new State('connectionStatus', 'disconnected')
</script>

<div>
  <label>
    <div class="header-t">Address</div>
    <div class="flex place-content-between">
      <div class="flex gap-2">
        {#if $connectionStatus == 'connected'}
          <div>🟢</div>
        {:else if $connectionStatus == 'connecting'}
          <div>🟡</div>
        {:else}
          <div>🔴</div>
        {/if}
        {$address || '(none)'}
      </div>
      {#if $connectionStatus == 'disconnected'}
        <button
          class="btn"
          on:click={() => {
            $address = prompt('Enter Node IP to connect to', $address || '')
          }}>Connect</button
        >
      {:else if $connectionStatus == 'connected'}
        <button class="btn" on:click={() => ($address = '')}>Disconnect</button>
      {/if}
    </div>
  </label>
</div>
