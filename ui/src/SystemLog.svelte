<script lang="ts">
  import axios from 'axios'
  import { onDestroy, onMount, tick } from 'svelte'
  import { scrollToBottom, userKey } from './lib/util'
  import { AnsiUp } from 'ansi_up'
  import { split } from 'postcss/lib/list'

  let ansi = new AnsiUp()

  let log: string[] = []
  let logElement: HTMLPreElement

  $: if (log && logElement) scrollToBottom(logElement)

  async function getLog() {
    try {
      log = (await axios.get('/consoleLog', { params: { accessKey: $userKey } })).data
      // console.log(typeof log)
    } catch (e) {
      console.error(e)
    }
  }

  onMount(getLog)
  let refreshInterval = setInterval(getLog, 500)
  onDestroy(() => clearInterval(refreshInterval))
</script>

<div class="flex flex-col gap-4">
  <pre bind:this={logElement} class="whitespace-pre-line overflow-auto h-80 rounded ring bg-black/20 p-4">{#each log as line}{@html ansi.ansi_to_html(line)}{/each}</pre>
  <button class="btn btn-sm" on:click={() => scrollToBottom(logElement, true)}>Scroll to bottom</button>
</div>
