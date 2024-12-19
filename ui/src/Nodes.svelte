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
  import { setPositionMode } from './Map.svelte'

  export let showInactive = false
  let selectedNode: NodeInfo
  export let ol: OpenLayersMap = undefined

  $: $nodes.length, showInactive, $nodeInactiveTimer, filterNodes()

  function filterNodes() {
    $inactiveNodes = $nodes.filter((node) => Date.now() - node.lastHeard * 1000 >= ($nodeInactiveTimer ?? 60) * 60 * 1000)

    $filteredNodes = $nodes
      .filter((node) => showInactive || node.num == $myNodeNum || !$inactiveNodes.some((inactive) => node.num == inactive.num))
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
        class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5 {node.num == $myNodeNum
          ? 'bg-gradient-to-r '
          : Date.now() - node.lastHeard * 1000 < ($nodeInactiveTimer ?? 60) * 60 * 1000
            ? ''
            : 'grayscale'}  "
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
                <div title="Client_Mute Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">CM</div>
              {:else if node.user.role.startsWith('CLIENT')}
                <div title="Other Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">C</div>
              {:else if node.user.role === 'TRACKER'}
                <div title="Tracker Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">T</div>
              {:else if node.user.role === 'SEONSOR'}
                <div title="Sensor Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">S</div>
              {:else if node.user.role === 'ROUTER'}
                <div title="Router Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">R</div>
              {:else if node.user.role === 'ROUTER_CLIENT'}
                <div title="Deprecated Router_Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">RC</div>
              {:else if node.user.role.startsWith('ROUTER')}
                <div title="Other Router Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">R</div>
              {/if}
            {/if}
            {#if node.viaMqtt}
              <div title="Node heard via MQTT" class="bg-rose-900/50 text-rose-200 rounded px-1 cursor-help text-xs">MQTT</div>
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
            {:else if $hasAccess}
              <button title="Set Position" class="rounded-md fill-cyan-400/80 text-lg -mx-0.5" on:click={() => ($setPositionMode = true)}
                ><svg width="24px" height="24px" viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M321.85,250.69c-4-33.61-30.39-61-65.85-61-36,0-66.34,30.31-66.34,66.34S220,322.34,256,322.34c35.47,0,61.84-27.41,65.85-61a18.39,18.39,0,0,0,.49-5.32A18.71,18.71,0,0,0,321.85,250.69ZM225.12,256c0-39.95,59.88-39.6,61.76,0C285,295.55,225.12,296,225.12,256Z"
                  /><path
                    d="M433.3,238.27H395c-7.27-51.81-41.57-96.15-91.93-114.52a133.34,133.34,0,0,0-29.29-7v-38c0-22.82-35.46-22.86-35.46,0V117c-34.91,4.65-68,22.22-90.69,50.08a141.57,141.57,0,0,0-30.44,71.24H78.7c-22.82,0-22.86,35.46,0,35.46H117a137.24,137.24,0,0,0,18.61,54.45c22.57,37.45,60.88,61.14,102.69,66.63V433.3c0,22.82,35.46,22.86,35.46,0V395.07c2.92-.35,5.85-.75,8.76-1.28,60.25-10.79,104-61.36,112.44-120.06H433.3C456.12,273.73,456.16,238.27,433.3,238.27ZM291.38,354.83a106,106,0,0,1-115.8-31.39c-62-73.5,5.19-188.93,99.84-170.61,49.75,9.63,84.51,53,85.5,103.17C360.05,299.87,333.32,340,291.38,354.83Z"
                  /></svg
                ></button
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
          {#if node.environmentMetrics}
            <div class="flex gap-1">
              {#if node.environmentMetrics.temperature}
                <div title="Temperature" class="text-sm font-normal bg-purple-950/20 text-purple-200/90 rounded p-0.5 w-12 h-6 text-center overflow-hidden">
                  {Math.round(node.environmentMetrics.temperature)} °C
                </div>
              {/if}
              {#if node.environmentMetrics.barometricPressure}
                <div title="Barometric Pressure" class="text-sm font-normal bg-purple-950/20 text-purple-200/90 rounded p-0.5 w-20 h-6 text-center overflow-hidden">
                  {Math.round(node.environmentMetrics.barometricPressure)} hPA
                </div>
              {/if}
              {#if node.environmentMetrics.relativeHumidity}
                <div title="Relative Humidity" class="text-sm font-normal bg-purple-950/20 text-purple-200/90 rounded p-0.5 w-12 h-6 text-center overflow-hidden">
                  {Math.round(node.environmentMetrics.relativeHumidity)}%
                </div>
              {/if}
              {#if node.environmentMetrics.gasResistance}
                <div title="Gas Resistance" class="text-sm font-normal bg-purple-950/20 text-purple-200/90 rounded p-0.5 w-20 h-6 text-center overflow-hidden">
                  {Math.round(node.environmentMetrics.gasResistance)} MOhm
                </div>
              {/if}
              {#if node.environmentMetrics.iaq}
                <div title="Air Quality" class="text-sm font-normal bg-purple-950/20 text-purple-200/90 rounded p-0.5 w-16 h-6 text-center overflow-hidden">
                  {Math.round(node.environmentMetrics.iaq)} IAQ
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {/each}
    {#if $hasAccess && !showInactive && $inactiveNodes.length >= 10}
      <button on:click={clearNodes} class="btn h-12">Clear {$nodes?.length - $filteredNodes?.length} Inactive Nodes</button>
    {/if}
  </div>
</Card>
