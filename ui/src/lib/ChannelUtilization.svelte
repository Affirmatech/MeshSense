<script lang="ts">
  import type { NodeInfo } from 'api/src/vars'
  export let node: NodeInfo

  let channelUtilizationINT = Math.floor(node.deviceMetrics?.channelUtilization || 0)
  let scaledHeight = Math.min(channelUtilizationINT * 2, 100)
  let colorClass = channelUtilizationINT < 15 ? 'green' : channelUtilizationINT < 25 ? 'yellow' : channelUtilizationINT < 35 ? 'orange' : 'red'
</script>

{#if node?.deviceMetrics?.channelUtilization}
  <div
    title="{channelUtilizationINT}% Observed Channel Utilization"
    class="absolute w-1.5 rounded bottom-1 top-1 right-0.5 overflow-hidden border border-white/20 flex flex-col"
    aria-label="Observed Channel Utilization: {channelUtilizationINT}%"
    aria-valuemin="0"
    aria-valuemax="50"
    aria-valuenow={channelUtilizationINT}
  >
    <div class="grow"></div>
    <div
      class:bg-green-500={colorClass === 'green'}
      class:bg-yellow-500={colorClass === 'yellow'}
      class:bg-orange-500={colorClass === 'orange'}
      class:bg-red-500={colorClass === 'red'}
      style="height: {scaledHeight}%;"
    ></div>
  </div>
{/if}
