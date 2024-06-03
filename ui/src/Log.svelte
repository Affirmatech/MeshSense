<script lang="ts">
  import { nodes, packets, type MeshPacket } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { scrollToBottom } from './lib/util'
  import { State } from 'api/src/lib/state'
  import Modal from './lib/Modal.svelte'

  function getNodeName(id: number) {
    if (id == 4294967295) return 'all'
    let node = nodes.value.find((node) => node.num == id)
    return node?.user?.shortName || node?.user?.id || id
  }

  function shouldPacketBeShown(packet: MeshPacket, includeTx) {
    if (!includeTx && packet.rxSnr == 0) return false
    return true
  }

  let packetsDiv: HTMLDivElement
  let includeTx = true
  let selectedPacket: MeshPacket
  $: if ($packets) scrollToBottom(packetsDiv)
</script>

<Modal title="Packet Detail" visible={selectedPacket != undefined}>
  <pre>{JSON.stringify(selectedPacket, undefined, 2)}</pre>
</Modal>

<Card title="Log" {...$$restProps}>
  <h2 slot="title" class="flex gap-2 font-bold rounded-t px-2">
    <div class="w-28">Date</div>
    <div class="w-24 whitespace-nowrap overflow-hidden">Nodes</div>
    <div class="w-9">Ch</div>
    <div class="w-10">SNR</div>
    <div class="w-10">RSSI</div>
    <div class="w-36">Type</div>
    <div class="w-10">Hops</div>
  </h2>
  <div bind:this={packetsDiv} class="p-1 px-2 text-sm overflow-auto grid h-full content-start">
    {#each $packets.filter((p) => shouldPacketBeShown(p, includeTx)) || [] as packet}
      <div class="flex gap-2 whitespace-nowrap">
        <div class="w-28">{new Date(packet.rxTime * 1000).toLocaleString(undefined, { day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
        <div class="w-24 flex gap-1">
          <div class=""><img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={packet.from}" alt="Node {packet.from}" /> {getNodeName(packet.from)}</div>
          {#if packet.to != 4294967295}
            <div>to</div>
            <div class="">{getNodeName(packet.to)}</div>
          {/if}
        </div>
        <div class="w-9">{packet.channel}</div>
        <div class="w-10">{packet.rxSnr}</div>
        <div class="w-10">{packet.rxRssi}</div>
        <div class="w-36">{packet.encrypted ? 'encrypted' : packet.decoded?.portnum}</div>

        <div class="w-10">
          {#if packet.hopStart}{packet.hopStart - packet.hopLimit} / {packet.hopStart}{/if}
        </div>
        <div>
          <button on:click={() => (selectedPacket = packet)}>🔍</button>
        </div>
        {#if packet.data?.['deviceMetrics']}
          <div class="bg-green-500/20 rounded px-1 my-0.5 text-xs ring-0 text-green-200 mx-2 w-fit">
            {Number(packet.data['deviceMetrics'].voltage).toFixed(1)}V {packet.data['deviceMetrics'].batteryLevel}%
          </div>
        {/if}
      </div>
      {#if typeof packet.data == 'string'}
        <div class="bg-blue-500/20 rounded px-1 ring-1 my-0.5 text-xs">
          {packet.data}
        </div>
      {/if}
      <!-- <div>{JSON.stringify(packet)}</div> -->
    {/each}
  </div>
  <h2 class="font-normal text-sm self-end">
    <label>Tx <input type="checkbox" bind:checked={includeTx} /></label>
  </h2>
</Card>
