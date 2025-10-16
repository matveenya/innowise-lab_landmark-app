<template>
  <section class="general-map__map-section">
    <LandmarkMap
      :landmarks="landmarks"
      class="general-map__map"
      @marker-click="$emit('marker-click', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import LandmarkMap from '../LandmarkMap.vue';
import type { LandmarkMarker } from '../../types';

interface Props {
  landmarks: LandmarkMarker[];
}

defineProps<Props>();

interface Emits {
  (e: 'marker-click', landmarkMarker: LandmarkMarker): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.general-map__map-section {
  height: 100%;
}

.general-map__map {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
