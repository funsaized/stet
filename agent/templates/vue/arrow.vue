<script setup lang="ts">
// Adapt these sample elements to existing source; retain their semantics and handlers.
import { ref } from "vue";
import { vStetArrow } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
const destination = ref<HTMLParagraphElement | null>(null);
</script>

<template>
  <p ref="destination">Consequences of this action</p>
  <!-- Wait until the destination exists before mounting the arrow host. -->
  <button v-if="destination" type="button" v-stet-arrow='{ ...{"seed":42,"label":"Review this action."}, to: destination }'>Review action</button>
</template>
