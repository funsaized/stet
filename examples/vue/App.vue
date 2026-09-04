<script setup lang="ts">
import { vStetCircle, vStetSticky } from "stet/vue";
import "stet/style.css";
</script>

<template>
  <h1>Create an account</h1>
  <input v-stet-circle="{ stroke: 'crimson' }" type="email" aria-label="Email" />
  <button v-stet-sticky="{ text: 'save this', side: 'right' }">Save</button>
</template>
