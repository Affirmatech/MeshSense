<script lang="ts">
import ButtonBar from "./ButtonBar.svelte"
import { isElectron } from "./util"
</script>

<div class="titlebar relative">
  <div class="w-full text-center">{$$restProps.title}</div>
  {#if isElectron}
    <div class="absolute right-0 top-0 h-full flex items-center pr-2">
      <ButtonBar />
    </div>
  {/if}
</div>
