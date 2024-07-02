<script lang="ts">
  import { channels } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { smallMode } from './Nodes.svelte'
  import { messageDestination } from './Message.svelte'
</script>

<Card title="Channels" {...$$restProps}>
  <div class="gap-1 p-2 text-sm grid {$smallMode ? 'grid-cols-1' : 'grid-cols-2'}">
    {#each $channels as channel}
      {#if channel.role != 'DISABLED'}
        <button
          on:click={() => {
            $messageDestination = channel.index
          }}
          class="btn whitespace-nowrap">{channel.index}: {channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</button
        >
      {/if}
    {/each}
  </div>
</Card>
