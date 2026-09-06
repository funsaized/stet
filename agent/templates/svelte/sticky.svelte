<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { sticky } from "@funsaized/stet/svelte";
import "@funsaized/stet/style.css";
</script>

<button type="button" use:sticky={{"seed":42,"text":"Review the consequences before continuing."}}>Review action</button>
