<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { circle } from "@funsaized/stet/svelte";
import "@funsaized/stet/style.css";
</script>

<button type="button" use:circle={{"seed":42,"description":"Review this action before continuing."}}>Review action</button>
