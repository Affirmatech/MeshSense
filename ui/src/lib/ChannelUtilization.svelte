<script lang="ts">
  import type { NodeInfo } from 'api/src/vars'
  export let node: NodeInfo

  $: channelUtilizationINT = node?.deviceMetrics?.channelUtilization ? Math.floor(node.deviceMetrics.channelUtilization) : null

  $: scaledHeight = channelUtilizationINT !== null ? Math.min(channelUtilizationINT * 2, 100) : 0

  function getColorClass(channelUtilizationINT: number) {
    if (!channelUtilizationINT) return 'grayscale' // default color when channelUtilizationINT is null
    if (channelUtilizationINT < 15) return 'bg-green-500'
    if (channelUtilizationINT < 20) return 'bg-[#9acd32]'
    if (channelUtilizationINT < 25) return 'bg-yellow-500'
    if (channelUtilizationINT < 30) return 'bg-orange-500'
    if (channelUtilizationINT < 35) return 'bg-red-500'
    return 'bg-[red]'
  }
</script>

<div
  title={channelUtilizationINT !== null ? channelUtilizationINT + '% Observed Channel Utilization' : 'Channel Utilization Not Reported'}
  class="absolute w-1.5 rounded bottom-1 top-1 right-0.5 overflow-hidden border border-white/20 flex flex-col"
  aria-label={channelUtilizationINT !== null ? 'Observed Channel Utilization: ' + channelUtilizationINT + '%' : 'Channel Utilization Not Reported'}
  aria-valuemin="0"
  aria-valuemax="50"
  aria-valuenow={channelUtilizationINT ?? 0}
>
  <div class="grow"></div>
  <div class={getColorClass(channelUtilizationINT)} style="height: {scaledHeight}%;"></div>
</div>
