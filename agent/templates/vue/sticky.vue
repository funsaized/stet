<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { ref } from "vue";
import { vStetSticky } from "@funsaized/stet/vue";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";
const handle = ref<StetHandle | null>(null);
const onHandle = (next: StetHandle | null) => { handle.value = next; };
</script>

<template>
  <button type="button" v-stet-sticky='{ ...{"seed":42,"text":"Review the consequences before continuing.","offsetY":8}, onHandle }'>Review action</button>
</template>
