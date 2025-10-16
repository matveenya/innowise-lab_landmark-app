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

.landmark-popup {
  padding: 0.5rem;
  min-width: 200px;
}

.landmark-popup h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1rem;
}

.landmark-popup p {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.875rem;
}

.landmark-popup button {
  background-color: #48bb78;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  width: 100%;
}

.landmark-popup button:hover {
  background-color: #38a169;
}
</style>
