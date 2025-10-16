<template>
  <div class="landmark-form__group">
    <label class="landmark-form__label">{{ $t('landmark.location') }}</label>
    <p class="landmark-form__help">{{ $t('landmark.selectLocation') }}</p>
    <LandmarkMap
      :selectable="true"
      :selected-position="selectedPosition"
      @position-select="$emit('update:selectedPosition', $event)"
      class="landmark-form__map"
    />
    <div v-if="!selectedPosition" class="landmark-form__error">
      {{ $t('landmark.noLocationSelected') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import LandmarkMap from '../LandmarkMap.vue';
import type { MapPosition } from '../../types';

interface Props {
  selectedPosition: MapPosition | null;
}

defineProps<Props>();

interface Emits {
  (e: 'update:selectedPosition', position: MapPosition): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.landmark-form__group {
  margin-bottom: 1.5rem;
}

.landmark-form__label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.landmark-form__help {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.landmark-form__map {
  height: 300px;
  margin-top: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
}

.landmark-form__error {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
