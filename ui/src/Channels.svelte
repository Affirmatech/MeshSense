<script lang="ts">
  import { channels } from 'api/src/vars'
</script>

<div>
  <h2 class="header-t">Channels</h2>
  <div class="!grid !grid-cols-2 gap-2 w-full">
    {#each $channels as channel}
      {#if channel.role != 'DISABLED'}
        <button class="btn">{channel.index}: {channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</button>
      {/if}
    {/each}
  </div>
</div>
