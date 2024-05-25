<script>
  export let title = ''
  export let tag = 'div'
  export let horizontal = false
</script>

<svelte:element this={tag} class="grid {horizontal ? 'grid-cols-[auto_1fr] ' : 'grid-rows-[auto_1fr]'} {$$restProps.class}">
  <slot name="title"><h2 class={horizontal ? 'rounded-l' : 'rounded-t'}>{title}</h2></slot>
  <div class="{horizontal ? 'rounded-r' : 'rounded-b'} grid items-center shadow-inner shadow-black/50 bg-black/20">
    <slot />
  </div>
</svelte:element>
