<template>
  <div class="general-map">
    <header class="general-map__header">
      <div class="general-map__header-content">
        <div class="general-map__brand">
          <h1 class="general-map__title">Landmark App</h1>
          <p class="general-map__user">Welcome, {{ userDisplayName }}!</p>
        </div>
        <nav class="general-map__nav">
          <div class="general-map__filters">
            <label class="general-map__filter-label">
              <input
                type="checkbox"
                v-model="showOnlyUserLandmarks"
                @change="onFilterChange"
                class="general-map__checkbox"
              />
              Show only my landmarks
            </label>
          </div>
          <button @click="showAddLandmark = true" class="general-map__add-btn">
            Add Landmark
          </button>
          <button @click="handleLogout" class="general-map__logout">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="general-map__main">
      <div class="general-map__content">
        <section class="general-map__map-section">
          <LandmarkMap
            :landmarks="displayedLandmarks"
            class="general-map__map"
            @marker-click="onMarkerClick"
          />
        </section>

        <aside class="general-map__sidebar">
          <div class="general-map__sidebar-header">
            <h2 class="general-map__sidebar-title">
              {{ showOnlyUserLandmarks ? 'My Landmarks' : 'Top Landmarks' }}
            </h2>
            <p
              class="general-map__sidebar-subtitle"
              v-if="!showOnlyUserLandmarks"
            ></p>
          </div>

          <div class="general-map__landmarks-list" @scroll="onScroll">
            <div
              v-for="landmark in displayedLandmarksList"
              :key="landmark.id"
              class="landmark-card"
              :class="{
                'landmark-card_active': selectedLandmark?.id === landmark.id,
              }"
              @click="selectLandmark(landmark)"
            >
              <div class="landmark-card__header">
                <h3 class="landmark-card__title">{{ landmark.name }}</h3>
                <div class="landmark-card__rating">
                  <span class="landmark-card__rating-value">
                    {{ landmark.averageRating.toFixed(1) }}
                  </span>
                  <span class="landmark-card__rating-star">★</span>
                </div>
              </div>

              <div class="landmark-card__meta">
                <span class="landmark-card__visits">
                  {{ landmark.visitCount }} visit{{
                    landmark.visitCount !== 1 ? 's' : ''
                  }}
                </span>
                <span
                  class="landmark-card__score"
                  v-if="!showOnlyUserLandmarks"
                >
                  Score:
                  {{
                    calculateScore(
                      landmark.averageRating,
                      landmark.visitCount
                    ).toFixed(2)
                  }}
                </span>
              </div>

              <div
                class="landmark-card__photos"
                v-if="landmark.photos.length > 0"
              >
                <div class="landmark-card__photos-count">
                  📷 {{ landmark.photos.length }} photo{{
                    landmark.photos.length !== 1 ? 's' : ''
                  }}
                </div>
              </div>

              <div class="landmark-card__actions">
                <div class="landmark-card__user-rating">
                  <span class="landmark-card__rating-label">Your rating:</span>
                  <div class="landmark-card__stars">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="landmark-card__star"
                      :class="{
                        'landmark-card__star_active':
                          star <= getUserRating(landmark),
                        'landmark-card__star_clickable':
                          !showOnlyUserLandmarks ||
                          landmark.createdBy === authStore.user?.uid,
                      }"
                      @click.stop="rateLandmark(landmark, star)"
                      :disabled="landmarksStore.loading"
                    >
                      ★
                    </button>
                  </div>
                </div>
              </div>

              <div
                class="landmark-card__author"
                v-if="landmark.createdBy === authStore.user?.uid"
              >
                <span class="landmark-card__author-badge">Your landmark</span>
              </div>
            </div>

            <div v-if="landmarksStore.loading" class="general-map__loading">
              Loading more landmarks...
            </div>

            <button
              v-if="
                !showOnlyUserLandmarks &&
                landmarksStore.hasMore &&
                !landmarksStore.loading
              "
              @click="loadMoreLandmarks"
              class="general-map__load-more"
            >
              Load More
            </button>

            <div
              v-if="displayedLandmarksList.length === 0"
              class="general-map__empty"
            >
              <p>No landmarks found.</p>
              <button
                v-if="showOnlyUserLandmarks"
                @click="showAddLandmark = true"
                class="general-map__empty-btn"
              >
                Add your first landmark
              </button>
            </div>
          </div>
        </aside>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLandmarksStore } from '../stores/landmarks';
import LandmarkMap from '../components/LandmarkMap.vue';
import LandmarkForm from '../components/LandmarkForm.vue';
import type { LandmarkFormData, Landmark, LandmarkMarker } from '../types';

const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();
const router = useRouter();

const showAddLandmark = ref(false);
const showOnlyUserLandmarks = ref(false);
const selectedLandmark = ref<Landmark | null>(null);

const userDisplayName = computed(() => {
  return authStore.user?.displayName || authStore.user?.email;
});

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

function calculateScore(averageRating: number, visitCount: number): number {
  const k = 0.1;
  return averageRating * (1 - Math.exp(-k * visitCount));
}

function getUserRating(landmark: Landmark): number {
  if (!authStore.user) return 0;
  return landmark.userRatings?.[authStore.user.uid] || 0;
}

onMounted(async () => {
  await landmarksStore.fetchLandmarks();
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

function selectLandmark(landmark: Landmark) {
  selectedLandmark.value = landmark;
}

function onMarkerClick(landmarkMarker: LandmarkMarker) {
  const fullLandmark =
    landmarksStore.landmarks.find((l) => l.id === landmarkMarker.id) ||
    landmarksStore.userLandmarks.find((l) => l.id === landmarkMarker.id);
  if (fullLandmark) {
    selectedLandmark.value = fullLandmark;
  }
}

async function rateLandmark(landmark: Landmark, rating: number) {
  if (!authStore.user) return;

  try {
    await landmarksStore.rateLandmark(landmark.id, rating);
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
    !showOnlyUserLandmarks.value
  ) {
    loadMoreLandmarks();
  }
}

async function handleLogout() {
  await authStore.logout();
  landmarksStore.clearLandmarks();
  router.push('/signin');
}
</script>

<style scoped>
.general-map {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
}

.general-map__header {
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.general-map__header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.general-map__brand {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.general-map__title {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.general-map__user {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.general-map__nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.general-map__filters {
  display: flex;
  align-items: center;
}

.general-map__filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
}

.general-map__checkbox {
  width: 1rem;
  height: 1rem;
}

.general-map__add-btn {
  padding: 0.5rem 1.5rem;
  background-color: #48bb78;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.general-map__add-btn:hover {
  background-color: #38a169;
  transform: translateY(-1px);
}

.general-map__logout {
  padding: 0.5rem 1.5rem;
  background-color: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.general-map__logout:hover {
  background-color: #c53030;
  transform: translateY(-1px);
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

.general-map__map-section {
  height: 100%;
}

.general-map__map {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.general-map__sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.general-map__sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
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

.general-map__landmarks-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.landmark-card {
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.landmark-card:hover {
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.landmark-card_active {
  border-color: #48bb78;
  background: #f0fff4;
}

.landmark-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.landmark-card__title {
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.landmark-card__rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #48bb78;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.landmark-card__rating-value {
  font-weight: 600;
}

.landmark-card__rating-star {
  font-size: 0.75rem;
}

.landmark-card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #a0aec0;
  margin-bottom: 0.75rem;
}

.landmark-card__photos {
  margin-bottom: 0.75rem;
}

.landmark-card__photos-count {
  font-size: 0.75rem;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.landmark-card__actions {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
}

.landmark-card__user-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4a5568;
}

.landmark-card__rating-label {
  font-size: 0.75rem;
  color: #718096;
}

.landmark-card__stars {
  display: flex;
  gap: 0.125rem;
}

.landmark-card__star {
  background: none;
  border: none;
  font-size: 1rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0.125rem;
}

.landmark-card__star_clickable:hover {
  color: #f6e05e;
}

.landmark-card__star_active {
  color: #f6e05e;
}

.landmark-card__star:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.landmark-card__author {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.landmark-card__author-badge {
  background: #bee3f8;
  color: #2c5282;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
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
  background: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.general-map__load-more:hover {
  background: #e2e8f0;
}

.general-map__empty {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.general-map__empty-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.general-map__modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.general-map__modal-content {
  background: white;
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
  }

  .general-map__sidebar {
    max-height: 400px;
  }

  .general-map__header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .general-map__nav {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .general-map__nav {
    flex-direction: column;
    gap: 1rem;
  }

  .general-map__filters {
    order: -1;
    justify-content: center;
  }
}
</style>
