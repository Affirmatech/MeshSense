<script lang="ts">
  import { channels } from 'api/src/vars'
  let selectedChannelIndex = 0
  $: selectedChannel = $channels?.[selectedChannelIndex]

  function onchange(e) {
    channels.upsert(selectedChannel)
  }
</script>

<div class="grid grid-cols-[auto_1fr] gap-3">
  <div class="flex flex-col gap-1 overflow-auto h-80 p-0.5 pr-1">
    {#each $channels as channel, channelIndex}
      <button
        class:outline={channelIndex == selectedChannelIndex}
        class:outline-1={channelIndex == selectedChannelIndex}
        class:outline-blue-500={channelIndex == selectedChannelIndex}
        class:-hue-rotate-60={channelIndex != selectedChannelIndex}
        class:saturate-50={channelIndex != selectedChannelIndex}
        class:saturate-0={channelIndex != selectedChannelIndex && channel.role == 'DISABLED'}
        class="btn w-12 h-8 text-sm hue-rot"
        on:click={() => (selectedChannelIndex = channelIndex)}>{channelIndex}</button
      >
    {/each}
  </div>
  {#if selectedChannel}
    <form on:change={onchange} class="flex flex-col gap-2">
      <label class="flex gap-2 items-center">
        <div class="font-bold w-14">Name</div>
        <input class="input grow max-w-sm" type="text" bind:value={selectedChannel.settings.name} />
      </label>
      <label class="flex gap-2 items-center">
        <div class="font-bold w-14">PSK</div>
        <input class="input grow max-w-sm" type="text" bind:value={selectedChannel.settings.psk} />
      </label>
      <label class="flex gap-2 items-center">
        <div class="font-bold w-14">Role</div>
        <select class="input grow max-w-sm" bind:value={selectedChannel.role}>
          <option value="DISABLED">Disabled</option>
          <option value="PRIMARY">Primary</option>
          <option value="SECONDARY">Secondary</option>
        </select>
      </label>
      <pre class="overflow-auto h-80 rounded ring bg-black/20 p-2 m-1 grow">{JSON.stringify($channels?.[selectedChannelIndex], undefined, 2) ?? ''}</pre>
    </form>
  {/if}
</div>
