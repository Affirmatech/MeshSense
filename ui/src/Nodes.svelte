<script context="module" lang="ts">
  export let smallMode = writable(false)
  export let filteredNodes = writable<NodeInfo[]>([])
  export let inactiveNodes = writable<NodeInfo[]>([])
</script>

<script lang="ts">
  import { currentTime, myNodeMetadata, myNodeNum, nodes, type NodeInfo } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { getCoordinates, hasAccess, unixSecondsTimeAgo } from './lib/util'
  import Microchip from './lib/icons/Microchip.svelte'
  import axios from 'axios'
  import Modal from './lib/Modal.svelte'
  import { writable } from 'svelte/store'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { messageDestination } from './Message.svelte'

  export let showInactive = false
  let selectedNode: NodeInfo
  export let ol: OpenLayersMap = undefined

  $: if ($nodes.length) showInactive, filterNodes()

  function filterNodes() {
    $inactiveNodes = $nodes.filter((node) => Date.now() - node.lastHeard * 1000 >= 3.6e6)

    $filteredNodes = $nodes
      .filter((node) => showInactive || !$inactiveNodes.some((inactive) => node.num == inactive.num))
      .sort((a, b) => {
        if (a.num === $myNodeNum) return -1
        if (b.num === $myNodeNum) return 1
        if (a.hopsAway == 0 && b.hopsAway == 0) return b.snr - a.snr
        return a.hopsAway === b.hopsAway ? a.user?.shortName?.localeCompare(b.user?.shortName) : a.hopsAway - b.hopsAway
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
      <div class="grow">{String(selectedNode?.user?.id)}</div>
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
        <input type="checkbox" bind:checked={showInactive} />
      </label>
    {/if}
    <button on:click={() => ($smallMode = !$smallMode)} class="btn !px-2 text-sm font-normal">{$smallMode ? '→' : '←'}</button>
  </h2>
  <div class="p-1 text-sm grid gap-1 overflow-auto h-full content-start">
    {#each $filteredNodes as node (node.num)}
      <div
        class:ring-1={node.hopsAway == 0}
        class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5 {node.num == $myNodeNum ? 'bg-gradient-to-r ' : ''}  {Date.now() - node.lastHeard * 1000 < 3.6e6 ? '' : 'grayscale'}"
      >
        {#if $smallMode}
          <div title={node.user?.longName} class="flex items-center gap-1">
            <img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={node.num}" alt="Node {node.user?.id}" />
            <!-- Shortname -->
            <button on:click={() => ($messageDestination = node.num)} class="bg-black/20 rounded w-12 text-center overflow-hidden">{node.user?.shortName || node.user?.id || '?'}</button>

            {#if node.snr && node.hopsAway == 0}
              <!-- SNR -->
              <div class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>

              <!-- RSSI -->
              <div class="text-sm w-8 shrink-0 text-center bg-black/20 rounded h-5">
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

            <button title={node.user?.longName || String(node.num)} class="text-left truncate max-w-44" on:click={() => ($messageDestination = node.num)}>{node.user?.longName || node.num}</button>
            {#if typeof node.user?.role == 'string' && node.user?.role?.includes('ROUTER')}
              <div class="bg-red-500/50 text-red-200 rounded px-1 font-bold">R</div>
            {/if}
            {#if typeof node.user?.role == 'string' && node.user?.role?.includes('CLIENT')}
              <div class="bg-blue-500/50 rounded px-1 font-bold">C</div>
            {/if}
            <div class="grow"></div>
            <!-- SNR -->
            {#if node.snr && node.hopsAway == 0}
              <div class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>

              <!-- RSSI -->
              <div class="text-sm w-8 shrink-0 text-center bg-black/20 rounded h-5">
                {node.rssi || '-'}
              </div>
            {/if}
          </div>

          <div class="flex gap-1.5 items-center">
            <!-- Shortname -->
            <button on:click={() => ($messageDestination = node.num)} class="bg-black/20 rounded p-1 w-12 text-center overflow-hidden">{node.user?.shortName || node.user?.id || '?'}</button>

            <!-- Last Heard -->
            {#key $currentTime}
              <div title={new Date(node.lastHeard * 1000).toLocaleString()} class="h-7 text-sm font-normal min-w-10 bg-black/20 rounded p-1 text-center">{unixSecondsTimeAgo(node.lastHeard)}</div>
            {/key}

            <!-- Voltage -->
            <div class="text-sm font-normal bg-black/20 rounded p-1 w-10 h-7 text-center">
              {(node.deviceMetrics?.voltage || 0).toFixed(1)}V
            </div>
            <!-- Battery -->
            <div class="text-sm font-normal bg-black/20 rounded p-1 min-w-11 h-7 text-center">
              {node.deviceMetrics?.batteryLevel || 0}%
              <div
                class="h-0.5"
                style="width: {node.deviceMetrics?.batteryLevel || 0}%; background-color: {node.deviceMetrics?.batteryLevel >= 70
                  ? 'green'
                  : node.deviceMetrics?.batteryLevel >= 30
                    ? 'yellow'
                    : 'red'};"
              ></div>
            </div>

            <!-- Hops -->
            <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded p-1 w-6 h-7 text-center">{node.num == $myNodeNum ? '-' : (node.hopsAway ?? '?')}</div>

            <button on:click={() => (selectedNode = node)}>🔍</button>
            <!-- <button class="h-7 w-5" on:click={() => send(prompt('Enter message to send'), node.num)}>🗨</button> -->

            {#if node.num != $myNodeNum}
              <button title="Traceroute" on:click={() => axios.post('/traceRoute', { destination: node.num })}>↯</button>
            {/if}

            <!-- {#if node.user?.hwModel}
              <button class="h-7 w-5 fill-blue-500" title={node.user?.hwModel}><Microchip /></button>
            {/if} -->

            <button
              class="h-7 w-5"
              title="Request Position"
              on:click={(e) => {
                axios.post('/requestPosition', { destination: node.num })
                if (!e.ctrlKey && node.position?.latitudeI) {
                  let [long, lat] = getCoordinates(node)
                  ol.flyTo(long, lat)
                }
              }}>{node.position?.latitudeI ? '🌐' : '📡'}</button
            >
          </div>
        {/if}
      </div>
    {/each}
    {#if $hasAccess && !showInactive && $inactiveNodes.length >= 10}
      <button on:click={clearNodes} class="btn h-12">Clear {$nodes?.length - $filteredNodes?.length} Inactive Nodes</button>
    {/if}
  </div>
</Card>
