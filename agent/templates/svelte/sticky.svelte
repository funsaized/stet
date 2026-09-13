<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { sticky } from "@funsaized/stet/svelte";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";
let handle: StetHandle | null = null;
const onHandle = (next: StetHandle | null) => { handle = next; };
</script>

<button type="button" use:sticky={{ ...{"seed":42,"text":"Review the consequences before continuing.","offsetY":8}, onHandle }}>Review action</button>
