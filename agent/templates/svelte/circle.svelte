<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { circle } from "@funsaized/stet/svelte";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";
let handle: StetHandle | null = null;
const onHandle = (next: StetHandle | null) => { handle = next; };
</script>

<button type="button" use:circle={{ ...{"seed":42,"description":"Review this action before continuing."}, onHandle }}>Review action</button>
