<script context="module" lang="ts">
  export let smallMode = writable(false)
  export let filteredNodes = writable<NodeInfo[]>([])
  export let inactiveNodes = writable<NodeInfo[]>([])
</script>

<script lang="ts">
  import { currentTime, myNodeMetadata, myNodeNum, nodeInactiveTimer, nodes, pendingTraceroutes, type NodeInfo } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { getCoordinates, getNodeName, getNodeNameById, hasAccess, unixSecondsTimeAgo } from './lib/util'
  import Microchip from './lib/icons/Microchip.svelte'
  import axios from 'axios'
  import Modal from './lib/Modal.svelte'
  import { writable } from 'svelte/store'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { messageDestination } from './Message.svelte'

  export let showInactive = false
  let selectedNode: NodeInfo
  export let ol: OpenLayersMap = undefined

  $: $nodes.length, showInactive, $nodeInactiveTimer, filterNodes()

  function filterNodes() {
    $inactiveNodes = $nodes.filter((node) => Date.now() - node.lastHeard * 1000 >= ($nodeInactiveTimer ?? 60) * 60 * 1000)

    $filteredNodes = $nodes
      .filter((node) => showInactive || !$inactiveNodes.some((inactive) => node.num == inactive.num))
      .sort((a, b) => {
        if (a.num === $myNodeNum) return -1
        if (b.num === $myNodeNum) return 1
        if (a.hopsAway == 0 && b.hopsAway == 0) return b.snr - a.snr
        return a.hopsAway === b.hopsAway ? getNodeName(a)?.localeCompare(getNodeName(b)) : a.hopsAway - b.hopsAway
      })
  }

  function clearNodes() {
    axios.post('/deleteNodes', { nodes: $inactiveNodes })
  }
</script>

<Modal title="Node Detail" visible={selectedNode != undefined}>
  <div class="flex items-center gap-2 flex-wrap">
    <div class="flex items-center bg-black/20 rounded gap-2 grow">
      <h2 class="rounded">Name</h2>
      <div class="grow">{selectedNode?.user?.longName}</div>
    </div>

    <div class="flex items-center bg-black/20 rounded gap-2 grow">
      <h2 class="rounded">Node Num</h2>
      <div class="grow">{String(selectedNode?.num)}</div>
    </div>

    <div class="flex items-center bg-black/20 rounded gap-2 grow">
      <h2 class="rounded">User ID</h2>
      <div class="grow">!{String(selectedNode?.num.toString(16))}</div>
    </div>

    {#if selectedNode?.num == $myNodeNum}
      <div class="flex items-center bg-black/20 rounded gap-2 grow">
        <h2 class="rounded">Firmware</h2>
        <div class="grow">{$myNodeMetadata?.firmwareVersion}</div>
      </div>
    {/if}
  </div>
  <pre class="mt-2 overflow-auto rounded p-2 h-full bg-black/20">{JSON.stringify(selectedNode, undefined, 2)}</pre>
</Modal>

<Card title="Nodes" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center gap-2">
    <div class="grow">Nodes</div>
    {#if !$smallMode}
      <label class="text-sm font-normal"
        >Inactive
        <input title="Toggle Inactive Nodes" type="checkbox" bind:checked={showInactive} />
      </label>
    {/if}
    <button title="Reduce/Expand Node List" on:click={() => ($smallMode = !$smallMode)} class="btn !px-2 text-sm font-normal">{$smallMode ? '→' : '←'}</button>
  </h2>
  <div class="p-1 text-sm grid gap-1 overflow-auto h-full content-start">
    {#each $filteredNodes as node (node.num)}
      <div
        class:ring-1={node.hopsAway == 0}
        class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5 {node.num == $myNodeNum ? 'bg-gradient-to-r ' : ''}  {Date.now() - node.lastHeard * 1000 <
        ($nodeInactiveTimer ?? 60) * 60 * 1000
          ? ''
          : 'grayscale'}"
      >
        {#if $smallMode}
          <div title={node.user?.longName} class="flex items-center gap-1">
            <img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={node.num}" alt="Node {node.user?.id}" />
            <!-- Shortname -->
            <button on:click={() => ($messageDestination = node.num)} class="bg-black/20 rounded w-12 text-center overflow-hidden">{node.user?.shortName || '?'}</button>

            {#if node.snr && node.hopsAway == 0}
              <!-- SNR -->
              <div title="SNR" class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>

              <!-- RSSI -->
              <div title="RSSI" class="text-sm w-8 shrink-0 text-center bg-black/20 rounded h-5">
                {node.rssi || '-'}
              </div>
            {:else}
              <!-- Hops -->
              <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded w-10 text-center">{node.num == $myNodeNum ? '-' : (node.hopsAway ?? '?')}</div>
            {/if}
          </div>
        {:else}
          <!-- Longname -->
          <div class="flex gap-1 items-center">
            <img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={node.num}" alt="Node {node.user?.id}" />

            <button title={node.user?.longName || '!' + node.num?.toString(16)} class="text-left truncate max-w-44" on:click={() => ($messageDestination = node.num)}
              >{node.user?.longName || '!' + node.num?.toString(16)}</button
            >
            {#if typeof node.user?.role === 'string'}
              {#if node.user.role === 'CLIENT'}
                <div title="Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">C</div>
              {:else if node.user.role === 'CLIENT_MUTE'}
                <div title="Client_Mute Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">CM🙊</div>
              {:else if node.user.role.startsWith('CLIENT')}
                <div title="Other Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">C</div>
              {:else if node.user.role === 'TRACKER'}
                <div title="Tracker Node" class="bg-indigo-500/50 text-indigo-200 rounded px-1 font-bold cursor-help">T</div>
              {:else if node.user.role === 'SEONSOR'}
                <div title="Sensor Node" class="bg-indigo-500/50 text-indigo-200 rounded px-1 font-bold cursor-help">S</div>
              {:else if node.user.role === 'ROUTER'}
                <div title="Router Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">R</div>
              {:else if node.user.role === 'ROUTER_CLIENT'}
                <div title="Deprecated Router_Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">RC</div>
              {:else if node.user.role.startsWith('ROUTER')}
                <div title="Other Router Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">R</div>
              {/if}
            {/if}
            <div class="grow"></div>
            <!-- SNR -->
            {#if node.snr && node.hopsAway == 0}
              <div title="SNR" class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>

              <!-- RSSI -->
              <div title="RSSI" class="text-sm w-8 shrink-0 text-center bg-black/20 rounded h-5">
                {node.rssi || '-'}
              </div>
            {/if}
          </div>

          <div class="flex gap-1.5 items-center">
            <!-- Shortname -->
            <button title="Short Name" on:click={() => ($messageDestination = node.num)} class="bg-black/20 rounded p-1 w-12 text-center overflow-hidden">{node.user?.shortName || '?'}</button>

            <!-- Last Heard -->
            {#key $currentTime}
              <div title={new Date(node.lastHeard * 1000).toLocaleString()} class="h-7 text-sm font-normal min-w-10 bg-black/20 rounded p-1 text-center">{unixSecondsTimeAgo(node.lastHeard)}</div>
            {/key}

            <!-- Voltage -->
            <div title="Voltage" class="text-sm font-normal bg-black/20 rounded p-1 w-10 h-7 text-center">
              {(node.deviceMetrics?.voltage || 0).toFixed(1)}V
            </div>
            <!-- Battery -->
            <div title="Battery Level" class="text-sm font-normal bg-black/20 rounded p-1 min-w-11 h-7 text-center">
              {#if node.deviceMetrics?.batteryLevel === 101}
                <!-- device using external power -->
                ⚡︎
              {:else}
                {node.deviceMetrics?.batteryLevel || 0}%
              {/if}
              <div
                class="h-0.5"
                style="width: {node.deviceMetrics?.batteryLevel || 0}%; background-color: {node.deviceMetrics?.batteryLevel === 101
                  ? 'steelblue'
                  : node.deviceMetrics?.batteryLevel >= 70
                    ? 'green'
                    : node.deviceMetrics?.batteryLevel >= 30
                      ? 'yellow'
                      : 'red'};"
              ></div>
            </div>

            <!-- Hops -->
            <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded p-1 w-6 h-7 text-center">{node.num == $myNodeNum ? '-' : (node.hopsAway ?? '?')}</div>

            <button title="Node Detail" on:click={() => (selectedNode = node)}>🔍</button>
            <!-- <button class="h-7 w-5" on:click={() => send(prompt('Enter message to send'), node.num)}>🗨</button> -->

            {#if node.num != $myNodeNum}
              <button
                class="{node.hopsAway == 0 || node.trace?.route ? 'border bg-blue-600/30' : ''} px-0.5 rounded-md border-blue-600/80 {$pendingTraceroutes.includes(node.num)
                  ? 'hue-rotate-90 animate-pulse'
                  : ''}"
                title="Traceroute {node.hopsAway == 0 ? 'Direct' : ''}{node?.trace ? [$myNodeNum, ...node?.trace?.route, node?.num].map((id) => getNodeNameById(id)).join(' -> ') : ''}"
                on:click={() => axios.post('/traceRoute', { destination: node.num })}>↯</button
              >
            {/if}

            <!-- {#if node.user?.hwModel}
              <button class="h-7 w-5 fill-blue-500" title={node.user?.hwModel}><Microchip /></button>
            {/if} -->

            {#if node.position?.latitudeI}
              <button
                class="h-7 w-5"
                title="Fly To"
                on:click={(e) => {
                  if (e.shiftKey || e.ctrlKey) axios.post('/requestPosition', { destination: node.num })
                  let [long, lat] = getCoordinates(node)
                  ol.flyTo(long, lat)
                }}
                >🌐
              </button>
            {:else}
              <button
                class="h-7 w-5"
                title="Request Position"
                on:click={(e) => {
                  axios.post('/requestPosition', { destination: node.num })
                }}
                >📡
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    {#if $hasAccess && !showInactive && $inactiveNodes.length >= 10}
      <button on:click={clearNodes} class="btn h-12">Clear {$nodes?.length - $filteredNodes?.length} Inactive Nodes</button>
    {/if}
  </div>
</Card>
