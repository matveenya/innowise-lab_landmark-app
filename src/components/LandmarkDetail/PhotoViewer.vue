<template>
  <div class="landmark-detail__photo-viewer" @click.self="$emit('close')">
    <div class="landmark-detail__photo-viewer-content">
      <button
        @click="$emit('close')"
        class="landmark-detail__photo-viewer-close"
      >
        ×
      </button>
      <button
        @click="$emit('prev')"
        class="landmark-detail__photo-nav landmark-detail__photo-nav_prev"
      >
        ‹
      </button>
      <img
        :src="photos[currentIndex]"
        :alt="`Photo ${currentIndex + 1}`"
        class="landmark-detail__photo-viewer-img"
      />
      <button
        @click="$emit('next')"
        class="landmark-detail__photo-nav landmark-detail__photo-nav_next"
      >
        ›
      </button>
      <div class="landmark-detail__photo-counter">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  photos: string[];
  currentIndex: number;
}

defineProps<Props>();

interface Emits {
  (e: 'close'): void;
  (e: 'prev'): void;
  (e: 'next'): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.landmark-detail__photo-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.landmark-detail__photo-viewer-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landmark-detail__photo-viewer-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.landmark-detail__photo-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1001;
  transition: background-color 0.3s;
}

.landmark-detail__photo-nav:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.landmark-detail__photo-nav_prev {
  left: -60px;
}

.landmark-detail__photo-nav_next {
  right: -60px;
}

.landmark-detail__photo-viewer-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.landmark-detail__photo-counter {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .landmark-detail__photo-nav_prev {
    left: 10px;
  }

  .landmark-detail__photo-nav_next {
    right: 10px;
  }

  .landmark-detail__photo-viewer-close {
    top: 10px;
    right: 10px;
  }
}
</style>
