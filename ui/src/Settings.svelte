<script context="module">
  import { entries, get, set } from 'idb-keyval'
  export let updateChannel = new State('updateChannel', undefined)
  export let enableAudioAlerts = writable()
  export let highlightOwnNode = writable((localStorage.getItem('highlightOwnNode') ?? 'true') == 'true')
  highlightOwnNode.subscribe((value) => localStorage.setItem('highlightOwnNode', String(value)))
  get('enableAudioAlerts').then((v) => enableAudioAlerts.set(v ?? true))
  enableAudioAlerts.subscribe((v) => {
    set('enableAudioAlerts', v)
  })
</script>

<script>
  import {
    accessKey,
    apiHostname,
    apiPort,
    packetLimit,
    messagePrefix,
    messageSuffix,
    allowRemoteMessaging,
    autoConnectOnStartup,
    automaticTraceroutes,
    tracerouteRateLimit,
    nodeInactiveTimer,
    myNodeMetadata,
    myNodeNum,
    meshMapForwarding
  } from 'api/src/vars'
  import { hasAccess, userKey, blockUserKey, getNodeById, displayFahrenheit } from './lib/util'
  import { State } from 'api/src/lib/state'
  import { tick } from 'svelte'
  import axios from 'axios'
  import { writable } from 'svelte/store'

  let clientKeyInput = $userKey

  function applyClientKey() {
    userKey.set(clientKeyInput)
  }

  // let myNode = getNodeById($myNodeNum)
  // let latitude = myNode?.position?.latitudeI / 10000000
  // let longitude = myNode?.position?.longitudeI / 10000000
</script>

<div class="flex flex-col gap-3">
  <div class="flex gap-1 flex-wrap items-center bg-white/5 rounded-lg p-1 px-3">
    <div class="font-bold w-11">Links</div>
    <a class="p-4 py-1 underline text-center text-blue-400 font-bold" target="_blank" href="https://affirmatech.com/meshsense/news">News</a>
    <a class="p-4 py-1 underline text-center text-blue-400 font-bold" target="_blank" href="https://affirmatech.com/meshsense/faq">FAQ</a>
    <a class="p-4 py-1 underline text-center text-blue-400 font-bold" target="_blank" href="https://purchase.affirmatech.com/?productId=MeshSenseDonation">Donate</a>
  </div>
  <label class="flex gap-2">
    <input type="checkbox" bind:checked={$enableAudioAlerts} />
    <div class="font-bold">Enable Audio Alerts</div>
  </label>
  {#if $hasAccess}
    <div class="flex flex-wrap gap-3">
      <label>
        <div class="font-bold">Log Size Limit</div>
        <input class="input w-28" type="text" bind:value={$packetLimit} />
      </label>

      <label>
        <div class="font-bold">Message Prefix</div>
        <input class="input w-36" type="text" bind:value={$messagePrefix} />
      </label>

      <label>
        <div class="font-bold">Message Suffix</div>
        <input class="input w-36" type="text" bind:value={$messageSuffix} />
      </label>
    </div>

    <!-- 
    <hr class="opacity-25" />

    <form on:change={positionChange} class="grid gap-2 max-w-xs md:max-w-none md:grid-cols-2">
      <input type="b">
      <div class="flex gap-2">
        <label class="grow">
          <div class="font-bold">Latitude</div>
          <input name="Latitude" class="input w-full" type="text" bind:value={latitude} />
        </label>
        <label class="grow">
          <div class="font-bold">Longitude</div>
          <input name="Longitude" class="input w-full" type="text" bind:value={longitude} />
        </label>
      </div>
      <label>
        <div class="font-bold">Precision</div>
        <input title="Broadcast Precision" class="w-full" type="range" min="" max="32" bind:value={precision} />
      </label>
    </form>
     -->

    <hr class="opacity-25" />

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$automaticTraceroutes} />
      <div class="font-bold">Automatically send Traceroute requests to active nodes when missing or when hops change</div>
    </label>

    <label>
      <div class="font-bold">Traceroute Rate Limit (Minutes per Node)</div>
      <input
        class="input w-28"
        type="number"
        min={15}
        on:change={(e) => {
          let newValue = Math.max(Number(e.currentTarget.value), 15)
          $tracerouteRateLimit = newValue
          e.currentTarget.value = String(newValue)
        }}
        value={$tracerouteRateLimit}
      />
    </label>

    <label>
      <div class="font-bold">Minutes of inactivity to mark node inactive</div>
      <input class="input w-28" type="number" bind:value={$nodeInactiveTimer} />
    </label>

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$allowRemoteMessaging} />
      <div class="font-bold">Allow remote connections to send messages</div>
    </label>

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$autoConnectOnStartup} />
      <div class="font-bold">Connect to node on startup</div>
    </label>

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$displayFahrenheit} />
      <div class="font-bold">Display temperature in Fahrenheit</div>
    </label>

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$highlightOwnNode} />
      <div class="font-bold">Highlight own node's log entries</div>
    </label>

    <label class="flex gap-2 items-center">
      <input
        type="checkbox"
        checked={$updateChannel == 'beta'}
        on:change={async (e) => {
          e.currentTarget.checked ? ($updateChannel = 'beta') : ($updateChannel = 'latest')
          await tick()
          axios.get('/checkUpdate')
        }}
      />
      <div class="font-bold">MeshSense Beta Updates</div>
      <button class="btn !mr-auto" on:click={() => axios.get('/checkUpdate')}>Check for updates</button>
    </label>

    <hr class="opacity-25" />

    <label class="flex gap-2">
      <input type="checkbox" bind:checked={$meshMapForwarding} />
      <div class="font-bold">Share collected map data with global MeshSense Map 🌎</div>
    </label>

    <a class="border-2 text-white/80 border-blue-700 rounded p-2 bg-black/50 text-center" href="https://meshsense.affirmatech.com" target="_blank" rel="noreferrer">Open Global MeshSense Map</a>

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
      <input class="input" type="password" bind:value={$accessKey} />
    </label>
    <div>This key of your choosing will be required to have access to certain features when connected remotely such as Connect and Disconnect.</div>
    <div>
      Remote users will enter this key into
      <span class="font-mono bg-black/20 px-2 rounded py-0.5">Client Access Key</span> to gain access.
    </div>
  {:else if !$blockUserKey}
    <form on:submit|preventDefault={applyClientKey}>
      <label>
        <div class="font-bold">Client Access Key</div>
        <input class="input" type="password" bind:value={clientKeyInput} />
        <button class="btn btn-small">Apply</button>
        {#if $hasAccess}<span class="ml-1">✅</span>{/if}
      </label>
    </form>
  {:else}
    <div>The client access key entered is incorrect. Please verify the key matches exactly including case-sensitive characters.</div>
  {/if}
</div>
