<template>
  <main class="app-container">
    <RouterView />
  </main>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
</style>
