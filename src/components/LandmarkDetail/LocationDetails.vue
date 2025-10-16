<template>
  <InfoSection title-key="landmark.location">
    <div class="landmark-detail__coordinates">
      {{ $t('landmark.coordinates') }}: {{ latitude.toFixed(4) }},
      {{ longitude.toFixed(4) }}
    </div>
    <LandmarkMap
      :landmarks="landmarkMarkers"
      :selected-position="selectedPosition"
      class="landmark-detail__map"
    />
  </InfoSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LandmarkMap from '../LandmarkMap.vue';
import InfoSection from './InfoSection.vue';
import type { LandmarkMarker, MapPosition } from '../../types';

interface Props {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
}

const props = defineProps<Props>();

const landmarkMarkers = computed((): LandmarkMarker[] => {
  return [
    {
      id: props.id,
      name: props.name,
      latitude: props.latitude,
      longitude: props.longitude,
      averageRating: props.averageRating,
    },
  ];
});

const selectedPosition = computed((): MapPosition => {
  return {
    lat: props.latitude,
    lng: props.longitude,
  };
});
</script>

<style scoped>
.landmark-detail__coordinates {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.landmark-detail__map {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
