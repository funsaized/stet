<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { vStetHighlight } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
</script>

<template>
  <button type="button" v-stet-highlight='{"seed":42,"description":"Review this action before continuing."}'>Review action</button>
</template>
