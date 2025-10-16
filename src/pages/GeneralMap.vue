<template>
  <div class="general-map">
    <GeneralMapHeader
      v-model:show-only-user-landmarks="showOnlyUserLandmarks"
      @filter-change="onFilterChange"
      @add-landmark="showAddLandmark = true"
      @logout="handleLogout"
    />
    <main class="general-map__main">
      <div class="general-map__content">
        <MapSection
          :landmarks="displayedLandmarks"
          @marker-click="onMarkerClick"
        />

        <GeneralMapSidebar
          :landmarks="displayedLandmarksList"
          :show-only-user-landmarks="showOnlyUserLandmarks"
          :selected-landmark-id="selectedLandmark?.id || null"
          :loading="landmarksStore.loading"
          :has-more="landmarksStore.hasMore"
          @scroll="onScroll"
          @load-more-landmarks="loadMoreLandmarks"
          @add-first-landmark="showAddLandmark = true"
          @view-landmark-details="viewLandmarkDetails"
          @rate-landmark="rateLandmark"
        />
      </div>
    </main>

    <div v-if="showAddLandmark" class="general-map__modal">
      <div class="general-map__modal-content">
        <LandmarkForm
          @submit="onAddLandmark"
          @cancel="showAddLandmark = false"
          :loading="landmarksStore.loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLandmarksStore } from '../stores/landmarks';
import GeneralMapHeader from '../components/GeneralMap/Header.vue';
import MapSection from '../components/GeneralMap/MapSection.vue';
import GeneralMapSidebar from '../components/GeneralMap/Sidebar.vue';
import LandmarkForm from '../components/LandmarkForm.vue';
import type { LandmarkFormData, Landmark, LandmarkMarker } from '../types';

const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();
const router = useRouter();

const showAddLandmark = ref(false);
const showOnlyUserLandmarks = ref(false);
const selectedLandmark = ref<Landmark | null>(null);

const displayedLandmarks = computed((): LandmarkMarker[] => {
  const landmarks = showOnlyUserLandmarks.value
    ? landmarksStore.userLandmarks
    : landmarksStore.landmarks;

  return landmarks.map((landmark) => ({
    id: landmark.id,
    name: landmark.name,
    latitude: landmark.latitude,
    longitude: landmark.longitude,
    averageRating: landmark.averageRating,
  }));
});

const displayedLandmarksList = computed(() => {
  if (showOnlyUserLandmarks.value) {
    return landmarksStore.userLandmarks;
  } else {
    return landmarksStore.paginatedLandmarks;
  }
});

function onLandmarkClick(landmarkId: string) {
  router.push(`/landmark/${landmarkId}`);
}

onMounted(async () => {
  await landmarksStore.fetchLandmarks();

  window.addEventListener('landmark-click', (event: Event) => {
    const customEvent = event as CustomEvent;
    onLandmarkClick(customEvent.detail);
  });
});

onUnmounted(() => {
  window.removeEventListener('landmark-click', (event: Event) => {
    const customEvent = event as CustomEvent;
    onLandmarkClick(customEvent.detail);
  });
});

async function onAddLandmark(formData: LandmarkFormData) {
  try {
    await landmarksStore.addLandmark(formData);
    showAddLandmark.value = false;

    if (showOnlyUserLandmarks.value) {
      await landmarksStore.fetchLandmarks(true);
    } else {
      await landmarksStore.fetchLandmarks();
    }
  } catch (error) {
    console.error('Error adding landmark:', error);
    alert('Error adding landmark: ' + (error as Error).message);
  }
}

async function onFilterChange() {
  if (showOnlyUserLandmarks.value) {
    await landmarksStore.fetchLandmarks(true);
  } else {
    await landmarksStore.fetchLandmarks();
  }
  selectedLandmark.value = null;
}

function onMarkerClick(landmarkMarker: LandmarkMarker) {
  onLandmarkClick(landmarkMarker.id);
}

async function rateLandmark(landmark: Landmark, rating: number) {
  if (!authStore.user) return;

  try {
    await landmarksStore.rateLandmark(landmark.id, rating);

    if (showOnlyUserLandmarks.value) {
      await landmarksStore.fetchLandmarks(true);
    } else {
      await landmarksStore.fetchLandmarks();
    }
  } catch (error) {
    console.error('Error rating landmark:', error);
    alert('Error rating landmark: ' + (error as Error).message);
  }
}

async function loadMoreLandmarks() {
  await landmarksStore.fetchMoreLandmarks();
}

function onScroll(event: Event) {
  const element = event.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = element;

  if (
    scrollHeight - scrollTop <= clientHeight + 100 &&
    !showOnlyUserLandmarks.value &&
    landmarksStore.hasMore &&
    !landmarksStore.loading
  ) {
    loadMoreLandmarks();
  }
}

async function handleLogout() {
  await authStore.logout();
  landmarksStore.clearLandmarks();
  router.push('/signin');
}

function viewLandmarkDetails(landmark: Landmark) {
  selectedLandmark.value = landmark;
  router.push(`/landmark/${landmark.id}`);
}
</script>

<style scoped>
.general-map {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
}

.general-map__main {
  flex: 1;
  padding: 1rem 0;
}

.general-map__content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 120px);
}

.general-map__modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.general-map__modal-content {
  background-color: #fff;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .general-map__content {
    grid-template-columns: 1fr;
    grid-template-rows: 400px 1fr;
    height: auto;
    min-height: calc(100vh - 120px);
  }
}

@media (max-width: 768px) {
  .general-map__content {
    padding: 0 10px;
  }
}
</style>
