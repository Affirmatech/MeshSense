<script context="module" lang="ts">
  export function sendDirect(message: string, destination: number) {
    if (!message) return
    axios.post('/send', { message, destination })
  }
  export let smallMode = writable(false)
  export let filteredNodes = writable<NodeInfo[]>([])
</script>

<script lang="ts">
  import { currentTime, myNodeNum, nodes, type NodeInfo } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { getCoordinates, unixSecondsTimeAgo } from './lib/util'
  import Microchip from './lib/icons/Microchip.svelte'
  import axios from 'axios'
  import Modal from './lib/Modal.svelte'
  import { writable } from 'svelte/store'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'

  export let showInactive = false
  let selectedNode: NodeInfo
  export let ol: OpenLayersMap = undefined

  $: $filteredNodes = $nodes
    .filter((node) => showInactive || Date.now() - node.lastHeard * 1000 < 3.6e6)
    .sort((a, b) => {
      if (a.num === $myNodeNum) return -1
      if (b.num === $myNodeNum) return 1
      return a.hopsAway === b.hopsAway ? a.user?.shortName?.localeCompare(b.user?.shortName) : a.hopsAway - b.hopsAway
    })
</script>

<Modal title="Node Detail" visible={selectedNode != undefined}>
  <pre>{JSON.stringify(selectedNode, undefined, 2)}</pre>
</Modal>

<Card title="Nodes" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="grow">Nodes</div>
    {#if !$smallMode}
      <label class="text-sm font-normal"
        >Inactive
        <input type="checkbox" bind:checked={showInactive} />
      </label>
    {/if}
  </h2>
  <div class="p-1 text-sm grid gap-1">
    {#each $filteredNodes as node (node.num)}
      <div
        class:ring-1={node.hopsAway == 0}
        class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5 {node.num == $myNodeNum ? 'bg-gradient-to-r ' : ''}  {Date.now() - node.lastHeard * 1000 < 3.6e6 ? '' : 'grayscale'}"
      >
        {#if $smallMode}
          <div title={node.user?.longName} class="flex items-center gap-1">
            <img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={node.num}" alt="Node {node.user?.id}" />
            <!-- Shortname -->
            <button on:click={() => sendDirect(prompt(`Enter message to send to ${node.user?.longName || node.num}`), node.num)} class="bg-black/20 rounded w-12 text-center overflow-hidden"
              >{node.user?.shortName || node.user?.id || '?'}</button
            >

            {#if node.snr && node.hopsAway == 0}
              <!-- SNR -->
              <div class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>
            {:else}
              <!-- Hops -->
              <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded w-10 text-center">{node.num == $myNodeNum ? '-' : node.hopsAway}</div>
            {/if}
          </div>
        {:else}
          <!-- Longname -->
          <div class="flex gap-1 items-center">
            <img class="h-4 inline-block" src="https://icongaga-api.bytedancer.workers.dev/api/genHexer?name={node.user?.id}" alt="Node {node.user?.id}" />

            <button
              title={node.user?.longName || String(node.num)}
              class="text-left truncate max-w-44"
              on:click={() => sendDirect(prompt(`Enter message to send to ${node.user?.longName || node.num}`), node.num)}>{node.user?.longName || node.num}</button
            >
            {#if node.user?.role?.includes('ROUTER')}
              <div class="bg-red-500/50 text-red-200 rounded px-1 font-bold">R</div>
            {/if}
            {#if node.user?.role?.includes('CLIENT')}
              <div class="bg-blue-500/50 rounded px-1 font-bold">C</div>
            {/if}
            <div class="grow"></div>
            <!-- SNR -->
            {#if node.snr && node.hopsAway == 0}
              <div class="text-sm w-10 shrink-0 text-center {node.snr && node.hopsAway == 0 ? 'bg-black/20' : ''} rounded h-5">
                {node.snr}
                <div class="h-0.5 -translate-y-0.5 scale-x-90" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
              </div>
            {/if}
          </div>

          <div class="flex gap-1.5 items-center">
            <!-- Shortname -->
            <div class="bg-black/20 rounded p-1 w-12 text-center overflow-hidden">{node.user?.shortName || node.user?.id || '?'}</div>

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
            <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded p-1 w-6 h-7 text-center">{node.num == $myNodeNum ? '-' : node.hopsAway}</div>

            <button on:click={() => (selectedNode = node)}>🔍</button>
            <!-- <button class="h-7 w-5" on:click={() => send(prompt('Enter message to send'), node.num)}>🗨</button> -->

            <button title="Traceroute" on:click={() => axios.post('/traceRoute', { destination: node.num })}>↯</button>

            {#if node.user?.hwModel}
              <button class="h-7 w-5 fill-blue-500" title={node.user?.hwModel}><Microchip /></button>
            {/if}

            {#if node.position?.latitudeI}
              <button
                class="h-7 w-5"
                on:click={() => {
                  let [long, lat] = getCoordinates(node)
                  ol.flyTo(long, lat)
                }}>🌐</button
              >
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</Card>
