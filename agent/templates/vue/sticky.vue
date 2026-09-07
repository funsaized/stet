<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { vStetSticky } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
</script>

<template>
  <button type="button" v-stet-sticky='{"seed":42,"text":"Review the consequences before continuing.","offsetY":8}'>Review action</button>
</template>
