<script lang="ts">
  import type { StetHandle } from "../../../../src/index.js";
  import { svelteCircle as circle } from "./adapter-types.js";

  let visible = $state(false);
  let handle = $state<StetHandle | null>(null);
  const onHandle = (next: StetHandle | null) => { handle = next; };
</script>

<button use:circle={{ visible, onHandle }}>Save</button>
