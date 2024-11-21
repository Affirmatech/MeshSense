<script lang="ts" context="module">
  import { writable } from 'svelte/store'
  export let messageDestination = writable(0)
</script>

<script lang="ts">
  import { channels, messagePrefix, messageSuffix } from 'api/src/vars'
  import Card from './lib/Card.svelte'
  import { filteredNodes, smallMode } from './Nodes.svelte'
  import axios from 'axios'
  import { getNodeName } from './lib/util'

  let inputElement: HTMLInputElement

  $: maxLength = 230 - $messagePrefix?.length - $messageSuffix?.length

  let message = ''

  $: if (inputElement && $messageDestination) {
    inputElement.focus()
  }

  function send() {
    if (!message) return

    let payload = { message }
    if (channels.value.some((c) => c.index == $messageDestination)) {
      payload['channel'] = $messageDestination
    } else {
      payload['destination'] = $messageDestination
    }

    axios.post('/send', payload).then(() => {
      message = ''
    })
  }
</script>

<Card class="shrink-0">
  <h2 slot="title" class="rounded-t flex items-center h-full gap-2">
    {#if !$smallMode}
      <div class="grow">Message</div>
    {/if}

    <select bind:value={$messageDestination} class="input font-normal text-sm border border-blue-500/50 !bg-blue-950" name="" id="">
      <option disabled>== Channels ==</option>
      {#each $channels as channel}
        {#if channel.role != 'DISABLED'}
          <option value={channel.index}>{channel.settings.name || `Channel ${channel.index}`}</option>
        {/if}
      {/each}

      <option disabled>== Nodes ==</option>
      {#each [...$filteredNodes].sort((a, b) => {
        return getNodeName(a).localeCompare(getNodeName(b))
      }) as node}
        <option value={node.num}>{getNodeName(node)}</option>
      {/each}
    </select>
  </h2>

  <form on:submit|preventDefault={send} class="p-2 flex flex-col gap-1 text-sm">
    <div class="flex gap-1" class:flex-col={$smallMode}>
      <input maxlength={maxLength} bind:this={inputElement} class="input w-full" size="3" type="text" bind:value={message} />
      <button class="btn">Send</button>
    </div>
  </form>
</Card>
