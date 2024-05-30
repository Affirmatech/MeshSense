<script lang="ts">
  import { currentTime, nodes } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { unixSecondsTimeAgo } from './lib/util'
  import Microchip from './lib/icons/Microchip.svelte'

  export let showInactive = false
</script>

<Card title="Nodes" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="grow">Nodes</div>
    <label class="text-sm font-normal"
      >Inactive
      <input type="checkbox" bind:checked={showInactive} />
    </label>
  </h2>
  <div class="p-1 text-sm grid gap-1">
    {#each $nodes
      .sort((a, b) => (a.hopsAway === b.hopsAway ? a.user?.shortName?.localeCompare(b.user?.shortName) : a.hopsAway - b.hopsAway))
      .filter((node) => showInactive || Date.now() - node.lastHeard * 1000 < 3.6e6) as node}
      <div class:ring-1={node.hopsAway == 0} class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5 ring-blue-500 {Date.now() - node.lastHeard * 1000 < 3.6e6 ? '' : 'grayscale'}">
        <!-- Longname -->
        <div class="">{node.user?.longName || node.num} ({node.user?.role || '?'})</div>
        <div class="flex gap-1.5 items-start">
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
              style="width: {node.deviceMetrics?.batteryLevel || 0}%; background-color: {node.deviceMetrics?.batteryLevel >= 70 ? 'green' : node.deviceMetrics?.batteryLevel >= 30 ? 'yellow' : 'red'};"
            ></div>
          </div>

          <!-- SNR -->
          <div class="text-sm w-12 shrink-0 text-center {node.snr ? 'bg-black/20' : ''} rounded h-7 p-1">
            {#if node.snr}
              {node.snr}
              <div class="h-0.5" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
            {/if}
          </div>

          <div title="{node.hopsAway} Hops Away" class="text-sm font-normal bg-black/20 rounded p-1 w-6 h-7 text-center">{node.hopsAway}</div>

          {#if node.user?.hwModel}
            <button class="h-7 w-5 fill-blue-500" title={node.user?.hwModel}><Microchip /></button>
          {/if}

          {#if node.position?.latitudeI}
            <button class="h-7 w-5">🌐</button>
          {/if}

          <!-- <div>
          {JSON.stringify(node)}
        </div> -->
        </div>
      </div>
    {/each}
  </div>
</Card>
