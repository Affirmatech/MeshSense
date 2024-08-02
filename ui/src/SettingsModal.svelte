<script context="module">
  export let showConfigModal = writable(false)
  let modalPage = writable('Settings')

  export function showPage(pageName = 'Settings') {
    modalPage.set(pageName)
    showConfigModal.set(true)
  }
</script>

<script>
  import Modal from './lib/Modal.svelte'
  import { license } from './gpl3'
  import Settings from './Settings.svelte'
  import { writable } from 'svelte/store'
</script>

<Modal title="Meshmagic" bind:visible={$showConfigModal}>
  <div class="grid grid-rows-[auto_1fr] gap-2">
    <!-- Sidebar -->
    <div class="flex gap-1">
      {#each ['Settings', 'Terms of Service'] as category}
        <button on:click={() => ($modalPage = category)} class="btn btn-sm h-8 w-32 {$modalPage == category ? 'brightness-125' : 'grayscale'}">{category}</button>
      {/each}
    </div>

    <!-- Content -->
    <div class="p-2">
      {#if $modalPage == 'Settings'}
        <Settings />
      {:else if $modalPage == 'Terms of Service'}
        <div class="flex flex-col gap-4">
          <div class="font-bold">Usage Warranty</div>
          <div class="font-mono">Affirmatech, Inc. disclaims all liability for damages (consequential and otherwise) arising from the use of this product. No other warranty is given.</div>
          <div class="font-bold">Meshmagic uses the Meshtastic Javascript library which is licensed under GPL-3 as follows:</div>
          <pre class="overflow-auto h-80 rounded ring bg-black/20 mr-10 p-4">{license}</pre>
          <div>For requests related to the GPL, please <a href="https://affirmatech.com/contact?product=Meshmagic">contact us</a> and we will accomodate your request.</div>
        </div>
      {/if}
    </div>
  </div>
</Modal>
