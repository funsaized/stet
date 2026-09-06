<script setup lang="ts">
import { ref, watchPostEffect } from 'vue';
import { circle } from '@funsaized/stet';
import '@funsaized/stet/style.css';
const props = withDefaults(defineProps<{ enabled?: boolean; destination?: number }>(), { enabled: true, destination: 1 });
const deleteButton = ref<HTMLButtonElement | null>(null);
// Own only the annotation: toggling it must preserve the native button and focus.
watchPostEffect(onCleanup => {
  if (!props.enabled || !deleteButton.value) return;
  const annotation = circle(deleteButton.value, {
    seed: 42,
    boil: 0,
    resketchOnHover: false,
    description: 'You will be asked to confirm before deleting saved settings.',
  });
  onCleanup(() => annotation.destroy());
});
const saved = ref(true);
function remove() { if (confirm('Delete saved settings?')) saved.value = false; }
</script>
<template><main><h1>Workspace settings</h1>
<label for="workspace-name">Workspace name</label><input id="workspace-name" value="Sketchbook" required />
<button id="save" type="submit">Save settings</button>
<button ref="deleteButton" id="delete" type="button" aria-describedby="native-warning" @click="remove">Delete saved settings</button>
<p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
<p v-if="destination > 0" :key="destination" id="consequences">You can set your preferences again after deletion.</p>
<output id="status">{{ saved ? 'Settings saved' : 'Saved settings deleted' }}</output>
<section><h2>Form examples</h2><label for="good-email">Email</label><input id="good-email" type="email" /><input id="bad-email" placeholder="Email" /></section>
<section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
</main></template>
