<template>
  <div class="general-map__sidebar-header">
    <h2 class="general-map__sidebar-title">
      {{
        showOnlyUserLandmarks
          ? $t('landmark.myLandmarks')
          : $t('landmark.topLandmarks')
      }}
    </h2>
    <p class="general-map__sidebar-subtitle" v-if="!showOnlyUserLandmarks">
      {{ $t('landmark.topLandmarks') }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showOnlyUserLandmarks: boolean;
}
defineProps<Props>();
</script>

<style scoped>
.general-map__sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.general-map__sidebar-title {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.general-map__sidebar-subtitle {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}
</style>
