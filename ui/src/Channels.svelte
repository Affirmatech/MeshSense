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
</script>

<Card title="Channels" {...$$restProps}>
  <div class="flex flex-wr gap-2 p-2 text-sm whitespace-nowrap">
    {#each $channels as channel}
      {#if channel.role != 'DISABLED'}
        <button
          on:click={() => {
            send(prompt('Enter message to send'), channel.index)
          }}
          class="btn">{channel.index}: {channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</button
        >
      {/if}
    {/each}
  </div>
</Card>
