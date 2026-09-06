<script lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { arrow } from "@funsaized/stet/svelte";
import "@funsaized/stet/style.css";
let destination: HTMLParagraphElement | undefined;
</script>

<p bind:this={destination}>Consequences of this action</p>
<!-- Wait for destination before mounting the action host. -->
{#if destination}
<button type="button" use:arrow={{ ...{"seed":42,"label":"Review this action."}, to: destination }}>Review action</button>
{/if}
