<script>
  import { packets } from 'api/src/vars'
  import Card from './lib/Card.svelte'
</script>

<Card title="Log" class="col-span-full">
  <div class="p-2">
    {#each $packets || [] as packet}
      <div>Packet</div>
    {/each}
  </div>
</Card>
