<template>
  <aside class="general-map__sidebar">
    <SidebarHeader :show-only-user-landmarks="showOnlyUserLandmarks" />

    <div class="general-map__landmarks-list" @scroll="$emit('scroll', $event)">
      <LandmarkCard
        v-for="landmark in landmarks"
        :key="landmark.id"
        :landmark="landmark"
        :is-active="selectedLandmarkId === landmark.id"
        :show-only-user-landmarks="showOnlyUserLandmarks"
        @view-details="$emit('view-landmark-details', $event)"
        @rate-landmark="
          (landmark, rating) => $emit('rate-landmark', landmark, rating)
        "
      />

      <div v-if="loading" class="general-map__loading">
        {{ $t('landmark.loadingMore') }}
      </div>

      <button
        v-if="!showOnlyUserLandmarks && hasMore && !loading"
        @click="$emit('load-more-landmarks')"
        class="general-map__load-more"
      >
        {{ $t('landmark.loadMore') }}
      </button>

      <div v-if="landmarks.length === 0" class="general-map__empty">
        <p>{{ $t('landmark.noLandmarksFound') }}</p>
        <button
          v-if="showOnlyUserLandmarks"
          @click="$emit('add-first-landmark')"
          class="general-map__empty-btn"
        >
          {{ $t('landmark.addFirstLandmark') }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarHeader from './SidebarHeader.vue';
import LandmarkCard from './LandmarkCard.vue';
import type { Landmark } from '../../types';

interface Props {
  landmarks: Landmark[];
  showOnlyUserLandmarks: boolean;
  selectedLandmarkId: string | null;
  loading: boolean;
  hasMore: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'scroll', event: Event): void;
  (e: 'load-more-landmarks'): void;
  (e: 'add-first-landmark'): void;
  (e: 'view-landmark-details', landmark: Landmark): void;
  (e: 'rate-landmark', landmark: Landmark, rating: number): void;
}

defineEmits<Emits>();
</script>

<style scoped>
.general-map__sidebar {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.general-map__landmarks-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.general-map__loading {
  text-align: center;
  padding: 1rem;
  color: #718096;
  font-size: 0.875rem;
}

.general-map__load-more {
  width: 100%;
  padding: 0.75rem;
  background-color: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.general-map__load-more:hover {
  background-color: #e2e8f0;
}

.general-map__empty {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.general-map__empty-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #48bb78;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .general-map__sidebar {
    max-height: 400px;
  }
}
</style>
