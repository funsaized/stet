<script setup lang="ts">
import { ref } from "vue";
import type { StetHandle } from "../../../../src/index.js";
import { vStetCircle } from "./adapter-types.js";

const visible = ref(false);
const handle = ref<StetHandle | null>(null);
const onHandle = (next: StetHandle | null) => { handle.value = next; };
</script>

<template>
  <button v-stet-circle="{ visible, onHandle }">Save</button>
</template>
