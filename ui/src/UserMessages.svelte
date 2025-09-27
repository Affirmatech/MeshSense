<script lang="ts">
  import { messages } from './lib/messageStore'
  import { onMount, tick } from 'svelte'
  import { getNodeNameById, isScrollAtEnd } from './lib/util'
  import { myNodeNum } from 'api/src/vars'

  let container: HTMLDivElement

  function scrollToBottom(force = false) {
    if (!container) return
    // Wait for the DOM to update before checking the scroll position
    tick().then(() => {
      const atEnd = isScrollAtEnd(container)
      if (atEnd || force) {
        container.scrollTop = container.scrollHeight
      }
    })
  }

  onMount(() => {
    scrollToBottom(true)
  })

  $: if ($messages) {
    scrollToBottom()
  }
</script>

<div bind:this={container} class="p-4 h-full overflow-y-auto">
  {#each $messages as msg (msg.id)}
    {@const isSent = msg.from === $myNodeNum}
    <div class="flex mb-4" class:justify-end={isSent}>
      <div class:text-right={isSent}>
        {#if !isSent}
          <p class="font-bold text-white text-sm mb-1 ml-1">{getNodeNameById(msg.from)}</p>
        {/if}
        <div
          class="p-3 rounded-lg inline-block max-w-xs lg:max-w-md"
          class:bg-blue-600={isSent}
          class:text-white={isSent}
          class:bg-gray-700={!isSent}
          class:text-gray-200={!isSent}
        >
          <p class="text-sm break-words">{msg.message.readable ?? msg.message.data}</p>
        </div>
        <span class="text-xs text-gray-500 mt-1 block mx-1">{new Date(msg.rxTime * 1000).toLocaleTimeString()}</span>
      </div>
    </div>
  {/each}
</div>