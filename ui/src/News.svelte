<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let newsVisible = writable(false)

  export let lastViewedNewsDate = Number(localStorage.getItem('lastViewedNewsDate')) || 0
</script>

<script>
  import Modal from './lib/Modal.svelte'
  import { meshSenseNewsDate } from 'api/src/vars'
  console.log({ lastViewedNewsDate })
  $: if (lastViewedNewsDate < $meshSenseNewsDate) {
    console.log({ lastViewedNewsDate, $meshSenseNewsDate })
    newsVisible.set(true)
    lastViewedNewsDate = $meshSenseNewsDate
    localStorage.setItem('lastViewedNewsDate', String($meshSenseNewsDate))
  }
</script>

<Modal title="Here's the latest in MeshSense!" bind:visible={$newsVisible} fillHeight={true}>
  <iframe title="MeshSense News" src="https://affirmatech.com/meshsense/news?contentOnly=1" class="grow h-full w-full"></iframe>
</Modal>
