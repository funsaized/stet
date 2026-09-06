<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { vStetCircle } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
</script>

<template>
  <button type="button" v-stet-circle='{"seed":42,"description":"Review this action before continuing."}'>Review action</button>
</template>
