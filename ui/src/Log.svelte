<script>
  import { packets } from 'api/src/vars'
  import Card from './lib/Card.svelte'
</script>

<Card title="Log">
  <div class="p-2 text-sm overflow-auto grid">
    <div class="flex gap-2 font-bold">
      <div class="w-28">Date</div>
      <div class="w-48 whitespace-nowrap overflow-hidden">Nodes</div>
      <div class="w-9">Ch</div>
      <div class="w-10">SNR</div>
      <div class="w-10">RSSI</div>
      <div class="w-36">Type</div>
      <div class="w-10">Hops</div>
    </div>
    {#each $packets || [] as packet}
      <div class="flex gap-2 whitespace-nowrap">
        <div class="w-28">{new Date(packet.rxTime * 1000).toLocaleString(undefined, { day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
        <div class="w-48">{packet.from} to {packet.to}</div>
        <div class="w-9">{packet.channel}</div>
        <div class="w-10">{packet.rxSnr}</div>
        <div class="w-10">{packet.rxRssi}</div>
        <div class="w-36">{packet.decoded?.portnum}</div>
        <div class="w-10">{packet.hopStart} / {packet.hopLimit}</div>
      </div>
      <!-- <div>{JSON.stringify(packet)}</div> -->
    {/each}
  </div>
</Card>
