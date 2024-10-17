<script lang="ts">
  import axios from 'axios'
  import { hasAccess } from './util'
  import { State } from 'api/src/lib/state'

  export let updateStatus = new State<any>('updateStatus', {})

  export let status = ''
  export let progress = 0
  export let version = ''

  // $: document.title = `MeshSense ${$version ?? 'Development'}`

  export let friendlyMessages = {
    'update-available': 'New update!',
    'download-progress': 'Downloading Update',
    'update-downloaded': 'Update Ready'
  }

  $: {
    status = friendlyMessages[$updateStatus.event]
    progress = $updateStatus.body?.percent
    version = $updateStatus.body?.version
  }

  function installUpdate() {
    axios.get('/installUpdate')
  }

  //runExample()
</script>

{#if status && $hasAccess}
  <div class="fixed top-12 right-5 p-2 w-40 bg-slate-900 rounded-xl z-[99]">
    <div class="text-xs grid items-center gap-1">
      {#if status == 'Update Ready'}
        <button class="btn btn-xs btn-primary grow py-2" on:click={installUpdate}>Install<br />MeshSense {version || ''}</button>
        <!-- <button class="btn btn-xs btn-primary saturate-50" on:click={() => (status = '')}>Changelog</button> -->
        <button class="btn btn-xs btn-primary saturate-50" on:click={() => (status = '')}>Later</button>
      {:else}
        <div class="flex flex-col gap-1">
          {status}
          {#if progress > 0}
            <progress class="progress rounded" value={progress} max="100" />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
