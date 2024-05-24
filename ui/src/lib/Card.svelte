<script>
  export let title = ''
  export let tag = 'div'
</script>

<svelte:element this={tag} {...$$restProps}>
  <slot name="title"><h2>{title}</h2></slot>
  <slot />
</svelte:element>
