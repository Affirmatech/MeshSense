<script context="module" lang="ts">
  export function send(message: string, channel: number) {
    if (!message) return
    axios.post('/send', { message, channel })
  }
</script>

<script lang="ts">
  import { channels } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import axios from 'axios'
  import { smallMode } from './Nodes.svelte'
</script>

<Card title="Channels" {...$$restProps} class="">
  <div class="gap-1 p-2 text-sm grid {$smallMode ? 'grid-cols-1' : 'grid-cols-2'}">
    {#each $channels as channel}
      {#if channel.role != 'DISABLED'}
        <button
          on:click={() => {
            send(prompt('Enter message to send'), channel.index)
          }}
          class="btn whitespace-nowrap">{channel.index}: {channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</button
        >
      {/if}
    {/each}
  </div>
</Card>
