<script lang="ts">
import { arrow, box, circle, sticky, type StetHandle } from "@funsaized/stet";
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
// Start hidden and animate on show so host code sequences reveal and replay.
export function attachMotionBox(target: Element) {
  return box(target, { seed: 45, visible: false, animate: true });
}
// Reduced motion settles immediately through the runtime; framework cleanup and
// handle.destroy() cancel any active show/replay work.
export async function runMotionSequence(handle: StetHandle | null) {
  if (!handle) return;
  handle.hide();
  if ((await handle.show()).status === "cancelled") return;
  if ((await handle.replay()).status === "cancelled") return;
  handle.hide();
}
</script>
<script setup lang="ts">
// Adapt to existing controls; annotation state never controls their presence.
import { ref, watchPostEffect } from "vue";
import "@funsaized/stet/style.css";

const props = withDefaults(defineProps<{ enabled?: boolean; destination?: number }>(), { enabled: true, destination: 0 });
const target = ref<HTMLButtonElement | null>(null);
const to = ref<HTMLParagraphElement | null>(null);
watchPostEffect(onCleanup => {
  if (target.value) onCleanup(attachMarks(target.value, to.value, props.enabled));
});
</script>
<template>
  <button ref="target" type="submit">Review action</button>
  <p v-if="props.destination > 0" :key="props.destination" ref="to">Consequences of this action</p>
</template>
