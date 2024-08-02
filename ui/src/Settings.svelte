<script>
  import { packetLimit } from 'api/src/vars'
</script>

<div>
  <label>
    <div>Log Size Limit</div>
    <input class="input" type="text" bind:value={$packetLimit} />
  </label>
</div>
