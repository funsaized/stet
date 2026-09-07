<script lang="ts">
// Adapt to existing controls; annotation state never controls their presence.
import { arrow, circle, sticky, type StetHandle } from "@funsaized/stet";
function attachMarks(target: Element, destination: Element | null | undefined, enabled: boolean) {
  const handles: StetHandle[] = [];
  const destroy = () => { for (const handle of handles.splice(0).reverse()) handle.destroy(); };
  try {
    if (enabled) {
      handles.push(circle(target, { seed: 42, description: "Review this action before continuing." }));
      handles.push(sticky(target, { seed: 43, text: "Read the consequences before continuing." }));
      if (destination) handles.push(arrow(target, destination, { seed: 44, label: "Consequences are explained here.", labelOffsetY: -12 }));
    }
    return destroy;
  } catch (error) { destroy(); throw error; }
}
import "@funsaized/stet/style.css";

let { enabled = true, destination = 0 }: { enabled?: boolean; destination?: number } = $props();
let target = $state<HTMLButtonElement>();
let to = $state<HTMLParagraphElement>();
$effect(() => {
  if (target) return attachMarks(target, to, enabled);
});
</script>
<button bind:this={target} type="submit">Review action</button>
{#if destination > 0}{#key destination}
  <p bind:this={to}>Consequences of this action</p>
{/key}{/if}
