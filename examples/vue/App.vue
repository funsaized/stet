<script setup lang="ts">
import { vStetCircle, vStetSticky, vStetUnderline } from "@funsaized/stet/vue";
import "@funsaized/stet/style.css";
</script>

<template>
  <h1 v-stet-underline="{ seed: 1, boil: 1.5 }">Create an account</h1>
  <p>Boiling ink: the heading’s underline wobbles unless reduced motion is enabled.</p>
  <input v-stet-circle="{ stroke: 'crimson' }" type="email" aria-label="Email" />
  <button v-stet-sticky="{ text: 'save this', side: 'right' }">Save</button>
</template>
