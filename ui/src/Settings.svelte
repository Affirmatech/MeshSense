<script>
  import { accessKey, apiHostname, apiPort, packetLimit, messagePrefix, messageSuffix, allowRemoteMessaging } from 'api/src/vars'
  import { hasAccess, userKey } from './lib/util'
</script>

<div class="flex flex-col gap-3">
  {#if $hasAccess}
    <label>
      <div class="font-bold">Log Size Limit</div>
      <input class="input" type="text" bind:value={$packetLimit} />
    </label>

    <label>
      <div class="font-bold">Message Prefix</div>
      <input class="input" type="text" bind:value={$messagePrefix} />
    </label>

    <label>
      <div class="font-bold">Message Suffix</div>
      <input class="input" type="text" bind:value={$messageSuffix} />
    </label>

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$allowRemoteMessaging} />
      <div class="font-bold">Allow remote connections to send messages</div>
    </label>

    <hr class="opacity-25" />
  {/if}

  <div>
    For your convienience, MeshSense can be remotely accessed using the following address: <a class="w-full" target="_blank" rel="noreferrer" href="http://{$apiHostname}:{$apiPort}"
      >http://{$apiHostname}:{$apiPort}</a
    >
  </div>

  {#if window.location.hostname == 'localhost'}
    <label class="">
      <div class="font-bold">Privileged Access Key</div>
      <input class="input" type="text" bind:value={$accessKey} />
    </label>
    <div>This key of your choosing will be required to have access to certain features when connected remotely such as Connect and Disconnect.</div>
    <div>
      Enter this key into
      <span class="font-mono bg-black/20 px-2 rounded py-0.5">Client Access Key</span> to gain access.
    </div>
  {:else}
    <label>
      <div class="font-bold">Client Access Key</div>
      <input class="input" type="text" bind:value={$userKey} />
      {#if $hasAccess}<span class="ml-1">✅</span>{/if}
    </label>
  {/if}
</div>
