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
        class="btn w-32 min-h-8 text-sm
        {channelIndex == selectedChannelIndex ? 'outline outline-1 outline-blue-500' : '-hue-rotate-60 saturate-50'}
        {channel.role == 'DISABLED' ? '!saturate-0' : ''}"
        on:click={() => (selectedChannelIndex = channelIndex)}>{channelIndex} {channel.settings?.name ? `- ${channel?.settings.name}` : ''}</button
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
