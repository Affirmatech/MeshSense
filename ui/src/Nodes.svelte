<script lang="ts">
  import { currentTime, nodes } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { unixSecondsTimeAgo } from './lib/util'
</script>

<Card title="Nodes" {...$$restProps}>
  <div class="p-1 text-sm grid gap-1">
    {#each $nodes as node}
      <div class="bg-blue-300/10 rounded px-1 py-0.5 flex flex-col gap-0.5">
        <!-- Longname -->
        <div class="">{node.user?.longName} ({node.user?.role})</div>
        <div class="flex gap-1.5 items-start">
          <!-- Shortname -->
          <div class="bg-black/20 rounded p-1 min-w-12 text-center">{node.user?.shortName}</div>

          <!-- Last Heard -->
          {#key $currentTime}
            <div title={new Date(node.lastHeard * 1000).toLocaleString()} class="text-sm font-normal min-w-10 bg-black/20 rounded p-1 text-center">{unixSecondsTimeAgo(node.lastHeard)}</div>
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
          <div class="text-sm w-12 shrink-0 text-center bg-black/20 rounded h-7 p-1">
            {#if node.snr}
              {node.snr}
              <div class="h-0.5" style="width: {((node.snr + 20) / 30) * 100}%; background-color: {node.snr >= 0 ? 'green' : node.snr >= -10 ? 'yellow' : 'red'};"></div>
            {/if}
          </div>

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
