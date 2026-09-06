<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { vStetMark } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
</script>

<template>
  <button type="button" v-stet-mark='{"seed":42,"description":"Review this action before continuing.","kind":"wrong"}'>Review action</button>
</template>
