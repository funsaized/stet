<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { ref } from "vue";
import { vStetBox } from "@funsaized/stet/vue";
import type { StetHandle } from "@funsaized/stet";
import "@funsaized/stet/style.css";
const handle = ref<StetHandle | null>(null);
const onHandle = (next: StetHandle | null) => { handle.value = next; };
</script>

<template>
  <button type="button" v-stet-box='{ ...{"seed":42,"description":"Review this action before continuing."}, onHandle }'>Review action</button>
</template>
