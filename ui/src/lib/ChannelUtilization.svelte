<script lang="ts">
  import type { NodeInfo } from 'api/src/vars';
  export let node: NodeInfo;
 
  $: channelUtilizationINT = node?.deviceMetrics?.channelUtilization 
    ? Math.floor(node.deviceMetrics.channelUtilization) 
    : null;
 
  $: scaledHeight = channelUtilizationINT !== null 
    ? Math.min(channelUtilizationINT * 2, 100) 
    : 0;
 
  $: colorClass = channelUtilizationINT !== null
    ? (channelUtilizationINT < 15 ? 'green' : 
       channelUtilizationINT < 25 ? 'yellow' : 
       channelUtilizationINT < 35 ? 'orange' : 
       'red')
    : 'grayscale'; // default color when channelUtilizationINT is null
</script>
 
<div
  title="{channelUtilizationINT !== null ? channelUtilizationINT + '% Observed Channel Utilization' : 'Channel Utilization Not Reported'}"
  class="absolute w-1.5 rounded bottom-1 top-1 right-0.5 overflow-hidden border border-white/20 flex flex-col"
  aria-label="{channelUtilizationINT !== null ? 'Observed Channel Utilization: ' + channelUtilizationINT + '%' : 'Channel Utilization Not Reported'}"
  aria-valuemin="0"
  aria-valuemax="50"
  aria-valuenow={channelUtilizationINT ?? 0}
>
  <div class="grow"></div>
  <div
    class:bg-green-500={colorClass === 'green'}
    class:bg-yellow-500={colorClass === 'yellow'}
    class:bg-orange-500={colorClass === 'orange'}
    class:bg-red-500={colorClass === 'red'}
    class:bg-gray-500={colorClass === 'grayscale'}
    style="height: {scaledHeight}%;"
  ></div>
</div>
