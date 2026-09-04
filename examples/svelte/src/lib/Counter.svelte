<script lang="ts">
  import { sticky } from 'stet/svelte'

  let count: number = $state(0)
  const increment = () => {
    count += 1
  }
</script>

<div class="counter-space">
  <button
    use:sticky={{
      text: count === 0 ? 'go on, click it' : `${count} tiny ${count === 1 ? 'victory' : 'victories'}`,
      side: 'bottom',
      seed: 5,
    }}
    type="button"
    class="counter"
    onclick={increment}
  >
    Count is {count}
  </button>
</div>

<style>
  .counter-space {
    margin-bottom: 6rem;
  }
</style>
