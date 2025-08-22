<script lang="ts">
import { version } from "api/src/vars"
import { newsVisible } from "../News.svelte"
import { showPage } from "../SettingsModal.svelte"
</script>

<div class="flex items-center gap-1 text-xs" style="-webkit-app-region: no-drag;">
  <div class="text-white/50 pr-2">MeshSense {$version}</div>
  <a href="https://affirmatech.com" target="_blank" rel="noopener" class="text-white/50 pr-2 font-normal">by Affirmatech</a>
  <a title="Support MeshSense" target="_blank" rel="noopener" class="text-rose-400! font-bold btn text-sm hover:brightness-110" href="https://purchase.affirmatech.com/?productId=MeshSenseDonation"
    >♥</a
  >
  <button title="What's New?" class="btn btn-sm h-6 grid place-content-center" onclick={() => newsVisible.set(true)}>📰</button>
  <a title="MeshSense Global Map" target="_blank" rel="noopener" class="font-bold btn text-sm hover:brightness-110" href="https://meshsense.affirmatech.com/">🌎</a>
  <button title="Settings" class="btn btn-sm h-6 font-normal grid place-content-center" onclick={() => showPage('Settings')}>⚙</button>
</div>