<script lang="ts">
  import { channels } from 'api/src/vars'
  import Card from './lib/Card.svelte'
</script>

<Card title="Channels" {...$$restProps}>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 p-2">
    {#each $channels as channel}
      {#if channel.role != 'DISABLED'}
        <button class="btn">{channel.index}: {channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</button>
      {/if}
    {/each}
  </div>
</Card>
