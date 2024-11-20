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
  import { hasAccess } from './lib/util'
  import SystemLog from './SystemLog.svelte'
  import DeviceConfig from './DeviceConfig.svelte'
  import Channels from './Channels.svelte'
</script>

<Modal title="MeshSense" bind:visible={$showConfigModal}>
  <div class="grid grid-rows-[auto_1fr] gap-2">
    <!-- Sidebar -->
    <div class="flex gap-1 -m-2 px-2 p-2 flex-wrap items-center border-b border-black/20 to-black/10 bg-gradient-to-b from-transparent">
      {#each ['Settings', 'Device', 'Channels', 'Log', 'Legal'] as category}
        <button
          class:hidden={['Log', 'Device'].includes(category) && !$hasAccess}
          on:click={() => ($modalPage = category)}
          class="btn btn-sm h-7 w-20 {$modalPage == category ? 'brightness-125' : 'grayscale'}">{category}</button
        >
      {/each}
    </div>
    <!-- Content -->
    <div class="p-2 grid h-full overflow-auto">
      {#if $modalPage == 'Settings'}
        <Settings />
      {:else if $modalPage == 'Legal'}
        <div class="flex flex-col gap-4">
          <div class="font-bold">Usage Warranty</div>
          <div class="font-mono">Affirmatech, Inc. disclaims all liability for damages (consequential and otherwise) arising from the use of this product. No other warranty is given.</div>
          <div class="font-bold">MeshSense uses the Meshtastic Javascript library which is licensed under GPL-3 as follows:</div>
          <pre class="overflow-auto h-80 rounded ring bg-black/20 mr-10 p-4">{license}</pre>
          <div>For requests related to the GPL, please <a href="https://affirmatech.com/contact?product=MeshSense">contact us</a> and we will accomodate your request.</div>
        </div>
      {:else if $modalPage == 'Log'}
        {#if $hasAccess}
          <SystemLog />
        {:else}
          <div>Please enter Access Key in Settings to view system log.</div>
        {/if}
      {:else if $modalPage == 'Device'}
        {#if $hasAccess}
          <DeviceConfig />
        {:else}
          <div>Please enter Access Key in Settings to view device config.</div>
        {/if}
      {:else if $modalPage == 'Channels'}
        {#if $hasAccess}
          <Channels />
        {:else}
          <div>Please enter Access Key in Settings to view channel config.</div>
        {/if}
      {/if}
    </div>
  </div>
</Modal>
