<template>
  <InfoSection title-key="landmark.photos">
    <div class="landmark-detail__photos">
      <div
        v-for="(photo, index) in photos"
        :key="index"
        class="landmark-detail__photo"
      >
        <img
          :src="photo"
          :alt="`Photo ${index + 1}`"
          class="landmark-detail__photo-img"
          @click="$emit('open-viewer', index)"
        />
      </div>
    </div>
  </InfoSection>
</template>

<script setup lang="ts">
import InfoSection from './InfoSection.vue';

interface Props {
  photos: string[];
}

defineProps<Props>();

interface Emits {
  (e: 'open-viewer', index: number): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.landmark-detail__photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.landmark-detail__photo {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}

.landmark-detail__photo:hover {
  transform: scale(1.05);
}

.landmark-detail__photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 480px) {
  .landmark-detail__photos {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
