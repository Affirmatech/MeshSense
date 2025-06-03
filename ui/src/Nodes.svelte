<script context="module" lang="ts">
  import { currentTime, myNodeMetadata, myNodeNum, nodeInactiveTimer, nodes, pendingTraceroutes, type NodeInfo } from 'api/src/vars'
  export let smallMode = writable(false)
  export let filteredNodes = writable<NodeInfo[]>([])
  export let inactiveNodes = writable<NodeInfo[]>([])
  export let nodeVisibilityMode = writable<string>(localStorage.getItem('nodeVisibilityMode') ?? 'active')
  export let sortField = writable<string>(localStorage.getItem('sortField') ?? 'lastHeard')
  export let sortDirection = writable<'asc' | 'desc'>(localStorage.getItem('sortDirection') as 'asc' | 'desc' ?? 'desc')

  export function isInactive(node: NodeInfo) {
    return Date.now() - node.lastHeard * 1000 >= (nodeInactiveTimer.value ?? 60) * 60 * 1000
  }
</script>

<script lang="ts">
  import Card from './lib/Card.svelte'
  import { formatTemp, getCoordinates, getNodeName, getNodeNameById, hasAccess, displayFahrenheit, unixSecondsTimeAgo } from './lib/util'
  import Microchip from './lib/icons/Microchip.svelte'
  import axios from 'axios'
  import Modal from './lib/Modal.svelte'
  import { writable } from 'svelte/store'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { messageDestination } from './Message.svelte'
  import { getSvgUri, setPositionMode } from './Map.svelte'
  import ChannelUtilization from './lib/ChannelUtilization.svelte'
  import ObservedRF from './lib/ObservedRF.svelte'

  export let includeMqtt = (localStorage.getItem('includeMqtt') ?? 'true') == 'true'
  let selectedNode: NodeInfo
  export let ol: OpenLayersMap = undefined
  export let filterText = writable('')

  $: localStorage.setItem('nodeVisibilityMode', $nodeVisibilityMode)
  $: localStorage.setItem('includeMqtt', String(includeMqtt))
  $: localStorage.setItem('sortField', $sortField)
  $: localStorage.setItem('sortDirection', $sortDirection)
  $: $nodes.length, $nodeInactiveTimer, $nodeVisibilityMode, includeMqtt, $filterText, $sortField, $sortDirection, filterNodes()

  function filterNodes() {
    $inactiveNodes = $nodes.filter(isInactive)

    $filteredNodes = $nodes
      .filter((node) => {
        switch ($nodeVisibilityMode) {
          case 'inactive':
            return $inactiveNodes.some((inactive) => node.num === inactive.num)
          case 'all':
            return true
          case 'active':
          default:
            return node.num === $myNodeNum || !$inactiveNodes.some((inactive) => node.num === inactive.num)
        }
      })
      .filter((node) => includeMqtt || !node.viaMqtt)
      .filter((node) => {
        const text = $filterText.toLowerCase();
        return (
          node.user?.longName?.toLowerCase().includes(text) ||
          node.user?.shortName?.toLowerCase().includes(text) ||
          node.user?.role?.toString().includes(text) ||
          node.num.toString().includes(text) ||
          node.num.toString(16).toLowerCase().includes(text)
        )
      })
      .sort((a, b) => {
        if (a.num === $myNodeNum) return -1
        if (b.num === $myNodeNum) return 1

        let aValue: any
        let bValue: any

        switch ($sortField) {
          case 'lastHeard':
            aValue = a.lastHeard
            bValue = b.lastHeard
            break
          case 'shortName':
            aValue = a.user?.shortName || ''
            bValue = b.user?.shortName || ''
            break
          case 'longName':
            aValue = a.user?.longName || ''
            bValue = b.user?.longName || ''
            break
          case 'batteryLevel':
            aValue = a.deviceMetrics?.batteryLevel || 0
            bValue = b.deviceMetrics?.batteryLevel || 0
            break
          case 'batteryVoltage':
            aValue = a.deviceMetrics?.voltage || 0
            bValue = b.deviceMetrics?.voltage || 0
            break
          case 'hops':
            aValue = a.hopsAway || 0
            bValue = b.hopsAway || 0
            break
          case 'distance':
            const aCoords = getCoordinates(a)
            const bCoords = getCoordinates(b)
            const myCoords = getCoordinates($myNodeNum)
            if (aCoords[0] && aCoords[1] && myCoords[0] && myCoords[1]) {
              aValue = Math.sqrt(Math.pow(aCoords[0] - myCoords[0], 2) + Math.pow(aCoords[1] - myCoords[1], 2))
            } else {
              aValue = Infinity
            }
            if (bCoords[0] && bCoords[1] && myCoords[0] && myCoords[1]) {
              bValue = Math.sqrt(Math.pow(bCoords[0] - myCoords[0], 2) + Math.pow(bCoords[1] - myCoords[1], 2))
            } else {
              bValue = Infinity
            }
            break
          case 'rssi':
            if ((a.hopsAway ?? 0) > 0 || (b.hopsAway ?? 0) > 0) {
              aValue = a.hopsAway ?? 99
              bValue = b.hopsAway ?? 99
            } else {
              aValue = a.rssi || -999
              bValue = b.rssi || -999
            }
            break
          case 'snr':
            if ((a.hopsAway ?? 0) > 0 || (b.hopsAway ?? 0) > 0) {
              aValue = a.hopsAway ?? 99
              bValue = b.hopsAway ?? 99
            } else {
              aValue = a.snr || -999
              bValue = b.snr || -999
            }
            break
          case 'channelUtilization':
            aValue = a.deviceMetrics?.channelUtilization || 0
            bValue = b.deviceMetrics?.channelUtilization || 0
            break
          default:
            aValue = a.lastHeard
            bValue = b.lastHeard
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return $sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return $sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      })
  }

  function clearNodes() {
    axios.post('/deleteNodes', { nodes: $inactiveNodes })
  }

  // Function to handle node visibility toggle
  function toggleNodeVisibility() {
    switch ($nodeVisibilityMode) {
      case 'active':
        $nodeVisibilityMode = 'inactive'
        break
      case 'inactive':
        $nodeVisibilityMode = 'all'
        break
      case 'all':
      default:
        $nodeVisibilityMode = 'active'
        break
    }
  }

  function getBatteryColor(batteryLevel) {
    if (batteryLevel === 101) return '' // use HTML style="background-color: 'steelblue'"
    if (batteryLevel >= 70) return 'bg-green-500'
    if (batteryLevel >= 50) return 'bg-[#9acd32]'
    if (batteryLevel >= 25) return 'bg-yellow-500'
    if (batteryLevel >= 10) return 'bg-orange-500'
    if (batteryLevel >= 6) return 'bg-red-500'
    return 'bg-[red]'
  }

  function toggleSortDirection() {
    $sortDirection = $sortDirection === 'asc' ? 'desc' : 'asc'
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
      <div class="grow">!{String(selectedNode?.num?.toString(16)?.padStart(8, '0'))}</div>
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
    <div class="flex items-center gap-2">
      <div class="grow flex items-center gap-2">
        Nodes
        {#if !$smallMode}
          <button
            title="Toggle Visibility - Currently Showing: {$nodeVisibilityMode}"
            on:click={toggleNodeVisibility}
            class="text-xs font-normal ml-1 {
              $nodeVisibilityMode === 'active' ? 'btn-active' :
              $nodeVisibilityMode === 'inactive' ? 'btn-inactive' :
              'btn'
            }"
          >
            {$filteredNodes.length}
          </button>
          <select bind:value={$sortField} class="btn text-xs font-normal w-20">
            <option value="lastHeard">Last Heard</option>
            <option value="shortName">Short Name</option>
            <option value="longName">Long Name</option>
            <option value="batteryLevel">Battery %</option>
            <option value="batteryVoltage">Voltage</option>
            <option value="hops">Hops</option>
            <option value="distance">Distance</option>
            <option value="rssi">RSSI</option>
            <option value="snr">SNR</option>
            <option value="channelUtilization">Channel Util</option>
          </select>
          <button title="Toggle Sort Direction" on:click={toggleSortDirection} class="btn text-xs font-normal">
            {$sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        {/if}
      </div>
      {#if !$smallMode}
        <button title="Toggle MQTT Nodes" on:click={() => (includeMqtt = !includeMqtt)} class="text-xs font-normal {includeMqtt ? 'btn' : 'btn-inactive'}">
          MQTT
        </button>
      {/if}
      <button title="Reduce/Expand Node List" on:click={() => ($smallMode = !$smallMode)} class="btn !px-2 text-sm font-normal">{$smallMode ? '→' : '←'}</button>
    </div>
  </h2>
  <div>
  {#if !$smallMode}
    <div class="grid m-2">
      <input type="text" placeholder="Node Filter..." bind:value={$filterText} class="input"/>
    </div>
  {/if}
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
          <!-- Short Mode -->
          <div title={node.user?.longName} class="flex items-center gap-1">
            <img class="h-4 inline-block" src={getSvgUri(String(node.num))} alt="Node {node.user?.id}" />

            <div class="relative w-2 h-6">
              <!-- Channel Utilization for smallMode -->
              <ChannelUtilization {node} />
            </div>

            <!-- Shortname -->
            <button on:click={() => ($messageDestination = node.num)} class="bg-black/20 rounded w-12 text-center overflow-hidden">{node.user?.shortName || '?'}</button>

            {#if node.snr && node.hopsAway == 0}
              <!-- display observed RF values for smallMode -->
              <ObservedRF {node} />
            {:else}
              <!-- Hops -->
              <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded w-10 text-center">{node.num == $myNodeNum ? '-' : (node.hopsAway ?? '?')}</div>
            {/if}
          </div>
        {:else}
          <!-- Large Mode -->
          <div class="flex gap-1 items-center">
            <img class="h-4 inline-block" src={getSvgUri(String(node.num))} alt="Node {node.user?.id}" />

            <div class="relative w-2 h-6">
              <!-- Channel Utilization for largeMode -->
              <ChannelUtilization {node} />
            </div>

            <!-- Longname -->
            <button title={node.user?.longName || '!' + node.num?.toString(16)?.padStart(8, '0')} class="text-left truncate max-w-44" on:click={() => ($messageDestination = node.num)}
              >{node.user?.longName || '!' + node.num?.toString(16)?.padStart(8, '0')}</button
            >

            {#if node.user?.role != undefined}
              {#if node.user.role === 0}
                <div title="Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">C</div>
              {:else if node.user.role === 1}
                <div title="Client_Mute Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">CM</div>
              {:else if node.user.role === 2}
                <div title="Router Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">R</div>
              {:else if node.user.role === 3}
                <div title="Deprecated Router_Client Node" class="bg-blue-500/50 rounded px-1 font-bold cursor-help">RC</div>
              {:else if node.user.role === 4}
                <div title="Repeater Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">Re</div>
              {:else if node.user.role === 5}
                <div title="Tracker Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">T</div>
              {:else if node.user.role === 6}
                <div title="Sensor Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">S</div>
              {:else if node.user.role === 7}
                <div title="TAK Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">TAK</div>
              {:else if node.user.role === 8}
                <div title="Client Hidden Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">CH</div>
              {:else if node.user.role === 9}
                <div title="Lost and Found Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">LF</div>
              {:else if node.user.role === 10}
                <div title="TAK Tracker Node" class="bg-indigo-500/50 text-indigo-300 rounded px-1 font-bold cursor-help">TT</div>
              {:else if node.user.role === 11}
                <div title="Router_Late Node" class="bg-red-500/50 text-red-200 rounded px-1 font-bold cursor-help">RL</div>
              {/if}
            {/if}
            {#if node.viaMqtt}
              <div title="Node heard via MQTT" class="bg-rose-900/50 text-rose-200 rounded px-1 cursor-help text-xs">MQTT</div>
            {/if}
            <div class="grow"></div>
            {#if node.snr && node.hopsAway == 0}
              <!-- display observed RF values -->
              <ObservedRF {node} />
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
                class="h-0.5 {getBatteryColor(node.deviceMetrics?.batteryLevel)}"
                style="width: {node.deviceMetrics?.batteryLevel || 0}%;
                      background-color: {node.deviceMetrics?.batteryLevel === 101 ? 'steelblue' : ''};"
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
                  {formatTemp(node.environmentMetrics.temperature, $displayFahrenheit)}
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
    {#if $hasAccess && $nodeVisibilityMode !== 'active' && $inactiveNodes.length >= 10}
      <button on:click={clearNodes} class="btn h-12">Clear {$inactiveNodes?.length} Inactive Nodes</button>
    {/if}
  </div>
</div>
</Card>
