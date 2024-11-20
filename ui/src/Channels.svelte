<script lang="ts">
  import { channels } from 'api/src/vars'
  let selectedChannelIndex = 0
</script>

<div class="grid grid-cols-[auto_1fr] gap-1">
  <div class="flex flex-col gap-1 overflow-auto h-80 p-0.5 pr-1">
    {#each $channels as channel, channelIndex}
      <button class:grayscale={channelIndex != selectedChannelIndex} class="btn w-36 text-sm" on:click={() => (selectedChannelIndex = channelIndex)}>{channelIndex}</button>
    {/each}
  </div>
  <pre class="overflow-auto h-80 rounded ring bg-black/20 p-2 m-1 grow">{JSON.stringify($channels?.[selectedChannelIndex], undefined, 2) ?? ''}</pre>
</div>
