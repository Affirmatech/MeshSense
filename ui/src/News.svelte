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
  <div class="flex flex-col h-full gap-4">
    <iframe title="MeshSense News" src="https://affirmatech.com/meshsense/news?contentOnly=1&?timestamp={Date.now()}" class="grow h-full w-full"></iframe>
    <div>
      Enjoying MeshSense? Please consider <a
        title="Support MeshSense"
        target="_blank"
        rel="noopener"
        class="btn text-sm hover:text-white"
        href="https://purchase.affirmatech.com/?productId=MeshSenseDonation">supporting us</a
      > and future development! Thanks! 🙂
    </div>
  </div>
</Modal>
