<script lang="ts">
  import { hasAccess } from './lib/util'
  import Card from './lib/Card.svelte'
  import ButtonBar from './lib/ButtonBar.svelte'
  import { isElectron } from './lib/util'
</script>

<Card title="Welcome" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center">
    <div class="mr-2">Welcome</div>
    <div class="flex-1 flex justify-end">
      {#if !isElectron}
        <ButtonBar />
      {/if}
    </div>
  </h2>
  
  <div class="grid items-center px-5 m-auto">
    <div class="relative top-1/2">
      <div class="flex items-end gap-2 mb-5">
      </div>
      <div class="text-3xl font-bold text-white">Welcome to MeshSense!</div>
      <div class="max-w-md mt-5 flex flex-col gap-4">
        <div>Available bluetooth devices will appear on the left</div>
        <div>If your device is on the network, enter it's IP address in the Device IP field and click Connect.</div>

        {#if !$hasAccess}
          <div>If you do not see the option to connect, you can get access by connecting via localhost or by setting your Access and User key.</div>
        {/if}

        <div>
          For additional information, take a look at our <a target="_blank" href="https://affirmatech.com/meshsense/faq">FAQ</a> and
          <a target="_blank" href="https://affirmatech.com/meshsense/bluetooth">Bluetooth Tips</a>
        </div>
      </div>
    </div>
  </div>
</Card>