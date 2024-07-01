<script lang="ts">
  import { channels } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { filteredNodes, smallMode } from './Nodes.svelte'

  let message = ''

  function send() {}
</script>

<Card class="shrink-0">
  <h2 slot="title" class="rounded-t flex items-center h-full gap-2">
    {#if !$smallMode}
      <div class="grow">Message</div>
    {/if}

    <select class="input font-normal text-sm border border-blue-500/50 !bg-blue-950" name="" id="">
      <option disabled>== Channels ==</option>
      {#each $channels as channel}
        {#if channel.role != 'DISABLED'}
          <option value={channel.index}>{channel.settings.name || (channel.settings?.psk?.toString() == 'AQ==' ? 'Long/Fast' : '')}</option>
        {/if}
      {/each}

      <option disabled>== Nodes ==</option>
      {#each [...$filteredNodes].sort((a, b) => {
        return (a.user?.shortName || String(a.user?.id)).localeCompare(b.user?.shortName || String(b.user?.id))
      }) as node}
        <option value={node.num}>{node.user?.shortName || node.user?.id}</option>
      {/each}
    </select>
  </h2>

  <form on:submit|preventDefault={send} class="p-2 flex flex-col gap-1 text-sm">
    <div class="flex gap-1" class:flex-col={$smallMode}>
      <input class="input w-full" size="3" type="text" bind:value={message} />
      <button class="btn">Send</button>
    </div>
  </form>
</Card>
