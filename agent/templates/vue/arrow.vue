<script setup lang="ts">
// Adapt to existing controls; annotation state never controls their presence.
import { ref, watchPostEffect } from "vue";
import { arrow, circle, sticky, type StetHandle } from "@funsaized/stet";
function attachMarks(target: Element, destination: Element | null | undefined, enabled: boolean) {
  const handles: StetHandle[] = [];
  const destroy = () => { for (const handle of handles.splice(0).reverse()) handle.destroy(); };
  try {
    if (enabled) {
      if (destination) handles.push(arrow(target, destination, { seed: 44, label: "Consequences are explained here." }));
    }
    return destroy;
  } catch (error) { destroy(); throw error; }
}
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
