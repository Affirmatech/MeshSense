<script lang="ts">
  import { broadcastId, channels, myNodeNum, nodes, packets, type MeshPacket } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { scrollToBottom } from './lib/util'
  import Modal from './lib/Modal.svelte'
  import { messageDestination } from './Message.svelte'

  function getNodeName(id: number) {
    if (id == broadcastId) return 'all'
    let node = nodes.value.find((node) => node.num == id)
    return node?.user?.shortName || node?.user?.id || String(id)
  }

  function shouldPacketBeShown(packet: MeshPacket, includeTx, filterText: string) {
    if (filterText) {
      if (!(getNodeName(packet.from).toLowerCase().includes(filterText.toLowerCase()) || getNodeName(packet.to).toLowerCase().includes(filterText.toLowerCase()))) return false
    }
    if (!includeTx && packet.deviceMetrics && packet.from == $myNodeNum) return false
    if (!includeTx && packet.decoded?.portnum == 'ROUTING_APP') return false
    return true
  }

  let packetsDiv: HTMLDivElement
  let includeTx = false
  let messagesOnly = false
  let selectedPacket: MeshPacket
  let filterText = ''
  let unseenMessages = false

  $: if ($packets) scrollToBottom(packetsDiv, false, (unseen) => (unseenMessages = unseen))
  $: messagesOnly, scrollToBottom(packetsDiv, true, (unseen) => (unseenMessages = unseen))
</script>

<Modal title="Packet Detail" visible={selectedPacket != undefined}>
  <pre>{JSON.stringify(selectedPacket, undefined, 2)}</pre>
</Modal>

<Card title="Log" {...$$restProps} class="min-h-36">
  <h2 slot="title" class="flex gap-2 font-bold rounded-t px-2">
    <div class="w-28">Date</div>
    <div class="w-40 whitespace-nowrap overflow-hidden">Nodes</div>
    <div class="w-7">Ch</div>
    <div class="w-10">SNR</div>
    <div class="w-10">RSSI</div>
    <div class="w-36">Type</div>
    <div class="w-10">Hops</div>
    <div class="w-52"></div>
  </h2>
  <div bind:this={packetsDiv} class="p-1 px-2 text-sm overflow-auto grid h-full content-start overflow-x-hidden">
    {#each $packets.filter((p) => shouldPacketBeShown(p, includeTx, filterText)).slice(-200) || [] as packet}
      {#if !messagesOnly || packet.message}
        <div class="flex gap-2 whitespace-nowrap">
          <div class="w-28">{packet.rxTime ? new Date(packet.rxTime * 1000).toLocaleString(undefined, { day: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}</div>

          <!-- Nodes -->
          <div class="w-40 flex gap-1 overflow-hidden">
            <div class=""><img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={packet.from}" alt="Node {packet.from}" /> {getNodeName(packet.from)}</div>
            {#if packet.to != 4294967295}
              <div>to</div>
              <div class="">{getNodeName(packet.to)}</div>
            {/if}
          </div>
          <div class="w-7">{packet.channel}</div>
          <div class="w-10">{packet.hopStart == packet.hopLimit ? packet.rxSnr || '' : ''}</div>
          <div class="w-10">{packet.hopStart == packet.hopLimit ? packet.rxRssi || '' : ''}</div>
          <div class="w-36">{packet.encrypted ? 'encrypted' : packet.decoded?.portnum}</div>

          <div class="w-10">
            {#if packet.hopStart}{packet.hopStart - packet.hopLimit} / {packet.hopStart}{/if}
          </div>
          <div>
            <button on:click={() => (selectedPacket = packet)}>🔍</button>
          </div>
          {#if packet.deviceMetrics}
            <div class="bg-green-500/20 rounded px-1 my-0.5 text-xs ring-0 text-green-200 mx-2 w-fit">
              {Number(packet.deviceMetrics.voltage).toFixed(1)}V {packet.deviceMetrics.batteryLevel}%
            </div>
          {:else if packet.position}
            <div class="bg-teal-800/60 rounded px-1 my-0.5 text-xs ring-0 text-teal-200 mx-2 w-fit">
              ({(packet.position.latitudeI / 10000000).toFixed(3)}, {(packet.position.longitudeI / 10000000).toFixed(3)}) {packet.position.altitude}m asl
            </div>
          {:else if packet.user}
            <div class="bg-indigo-800/60 rounded px-1 my-0.5 text-xs ring-0 text-indigo-300 mx-2 w-fit">
              {packet?.user?.longName}
            </div>
          {:else if packet.routing}
            <div class="bg-pink-800/40 rounded px-1 my-0.5 text-xs ring-0 text-white/80 mx-2 w-fit">
              Err: {packet?.routing?.errorReason}
            </div>
          {:else if packet.trace}
            <div class="bg-purple-800/60 rounded px-1 my-0.5 text-xs ring-0 text-white/80 mx-2 w-fit">
              {[packet.to, ...packet?.trace?.route, packet.from].map((id) => getNodeName(id)).join(' -> ')}
            </div>
          {/if}
        </div>
      {/if}
      {#if packet.message}
        <div class="bg-blue-500/20 rounded px-1 ring-1 my-0.5 text-sm w-fit">
          {#if packet.to == broadcastId}
            <button on:click={() => ($messageDestination = packet.channel)} class="font-bold text-white">{channels.value[packet.channel]?.settings?.name || 'Primary'}</button>
          {/if}
          <button class="font-bold" on:click={() => ($messageDestination = packet.from)}>{getNodeName(packet.from)}:</button>
          {packet.message.data}
        </div>
      {/if}
      <!-- <div>{JSON.stringify(packet)}</div> -->
    {/each}
  </div>
  <h2 class="relative font-normal text-sm self-end flex gap-4">
    <label>Self Metrics <input type="checkbox" bind:checked={includeTx} /></label>
    <label>Messages Only <input type="checkbox" bind:checked={messagesOnly} /></label>
    <label class="flex gap-1"
      >Filter <input class="rounded bg-black text-blue-300 font-bold px-2 w-20" type="text" bind:value={filterText} />
      {#if filterText}<button on:click={() => (filterText = '')} class="btn text-sm !py-0">Clear</button>{/if}
      {#if unseenMessages}<button class="btn !py-0 bottom-10" on:click={() => scrollToBottom(packetsDiv, true, (unseen) => (unseenMessages = unseen))}>Jump to new messages</button>{/if}
    </label>
  </h2>
</Card>
