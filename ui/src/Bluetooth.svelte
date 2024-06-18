<script lang="ts">
  import { State } from 'api/src/lib/state'
  import Card from './lib/Card.svelte'
  import axios from 'axios'
  import { address } from 'api/src/vars'

  let bluetoothDeviceList = new State<{ id: string; name: string }[]>('bluetoothDeviceList', [])
</script>

<Card title="BLE Devices">
  <div class="text-sm p-2 flex flex-col gap-1">
    {#each $bluetoothDeviceList as { id, name }}
      <button
        class="btn"
        on:click={() => {
          $address = id
        }}
      >
        {name}
      </button>
    {/each}
  </div>
</Card>
