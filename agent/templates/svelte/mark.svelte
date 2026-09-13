<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { mark } from "@funsaized/stet/svelte";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";
let handle: StetHandle | null = null;
const onHandle = (next: StetHandle | null) => { handle = next; };
</script>

<button type="button" use:mark={{ ...{"seed":42,"description":"Review this action before continuing.","kind":"wrong"}, onHandle }}>Review action</button>
