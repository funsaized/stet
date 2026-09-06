<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { mark } from "@funsaized/stet/svelte";
import "@funsaized/stet/style.css";
</script>

<button type="button" use:mark={{"seed":42,"description":"Review this action before continuing.","kind":"wrong"}}>Review action</button>
