<script lang="ts">
  import { State } from 'api/src/lib/state'
  import Card from './lib/Card.svelte'
  import { address, connectionStatus } from 'api/src/vars'
  import { smallMode } from './Nodes.svelte'
  import axios from 'axios'
  import { hasAccess } from './lib/util'

  let bluetoothDeviceList = new State<{ id: string; name: string }[]>('bluetoothDeviceList', [])
</script>

{#if $connectionStatus == 'disconnected' && $hasAccess}
  <Card title="BLE Devices" {...$$restProps}>
    <div class="text-sm p-2 flex flex-col gap-1">
      {#if $bluetoothDeviceList.length == 0}
        <p>
          No bluetooth {#if $smallMode}<br />{/if}devices detected
        </p>
      {/if}
      {#each $bluetoothDeviceList as { id, name }}
        <button
          class="btn"
          on:click={() => {
            $address = id
            axios.post('/connect', { address: id })
          }}
        >
          {name}
        </button>
      {/each}
    </div>
  </Card>
{/if}
