<script>
  export let title = ''
  export let tag = 'div'
  export let horizontal = false
</script>

<svelte:element this={tag} class="grid {horizontal ? 'grid-cols-[auto_1fr] ' : 'grid-rows-[auto_1fr]'} overflow-auto {$$restProps.class}" style={$$restProps.style}>
  <slot name="title"><h2 class={horizontal ? 'rounded-l' : 'rounded-t'}>{title}</h2></slot>
  <div class="{horizontal ? 'rounded-r' : 'rounded-b'} grow grid items-start shadow-inner shadow-black/50 bg-black/10 h-full overflow-auto">
    <slot />
  </div>
</svelte:element>
