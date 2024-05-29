<script lang="ts">
  import { nodes, packets } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { scrollToBottom } from './lib/util'

  function getNodeName(id: number) {
    if (id == 4294967295) return 'all'
    let node = nodes.value.find((node) => node.num == id)
    return node?.user?.shortName || node?.user?.id
  }

  let packetsDiv: HTMLDivElement
  $: if ($packets) scrollToBottom(packetsDiv)
</script>

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
  <div bind:this={packetsDiv} class="p-2 text-sm overflow-auto grid h-full content-start">
    {#each $packets || [] as packet}
      <div class="flex gap-2 whitespace-nowrap">
        <div class="w-28">{new Date(packet.rxTime * 1000).toLocaleString(undefined, { day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' })}</div>
        <div class="w-24 flex gap-1">
          <div class="">{getNodeName(packet.from)}</div>
          {#if packet.to != 4294967295}
            <div>to</div>
            <div class="">{getNodeName(packet.to)}</div>
          {/if}
        </div>
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
