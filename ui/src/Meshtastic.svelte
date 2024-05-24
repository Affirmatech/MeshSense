<script lang="ts">
  import { connectionStatus, address } from 'api/src/vars'
  import Card from './lib/Card.svelte'
</script>

<!-- Address -->
<div>
  <!-- <Card title="Address">Hello!</Card> -->
  <h2 class="header-t">Address</h2>
  <div class="flex place-content-between">
    <div class="flex gap-2">
      <!-- Connection Icon -->
      {#if $connectionStatus == 'connected'}
        <div>🟢</div>
      {:else if $connectionStatus == 'connecting'}
        <div>🟡</div>
      {:else}
        <div>🔴</div>
      {/if}

      <!-- URL -->
      {$address || '(none)'}
    </div>

    <!-- Connect / Disconnect -->
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
</div>
