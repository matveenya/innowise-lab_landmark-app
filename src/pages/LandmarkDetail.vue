<template>
  <div class="landmark-detail">
    <div class="landmark-detail__header">
      <button @click="$router.back()" class="landmark-detail__back-btn">
        ← {{ $t('landmark.backToMap') }}
      </button>

      <template v-if="landmark">
        <h1 class="landmark-detail__title">{{ landmark.name }}</h1>
        <div v-if="canEdit" class="landmark-detail__actions">
          <button
            @click="editMode = true"
            class="landmark-detail__edit-btn"
            :disabled="saving"
          >
            {{ $t('common.edit') }}
          </button>
          <button
            v-if="canDelete"
            @click="deleteLandmark"
            class="landmark-detail__delete-btn"
            :disabled="deleting"
          >
            {{ deleting ? $t('common.loading') : $t('common.delete') }}
          </button>
        </div>
      </template>
      <div v-else class="landmark-detail__title-placeholder"></div>
    </div>

    <div v-if="loading" class="landmark-detail__loading">
      {{ $t('common.loading') }}
    </div>

    <div v-else-if="!landmark" class="landmark-detail__not-found">
      <p>Landmark not found</p>
      <button
        @click="$router.push('/generalmap')"
        class="landmark-detail__back-to-map"
      >
        {{ $t('landmark.backToMap') }}
      </button>
    </div>

    <div v-else class="landmark-detail__content">
      <LandmarkForm
        v-if="editMode"
        :landmark="landmark"
        :loading="saving"
        @submit="onUpdateLandmark"
        @cancel="editMode = false"
      />

      <div v-else class="landmark-detail__view">
        <div class="landmark-detail__info">
          <div class="landmark-detail__section">
            <h2 class="landmark-detail__section-title">
              {{ $t('landmark.description') }}
            </h2>
            <p class="landmark-detail__description">
              {{ landmark.description }}
            </p>
          </div>

          <div class="landmark-detail__section">
            <h2 class="landmark-detail__section-title">
              {{ $t('landmark.location') }}
            </h2>
            <div class="landmark-detail__coordinates">
              {{ $t('landmark.coordinates') }}:
              {{ landmark.latitude.toFixed(4) }},
              {{ landmark.longitude.toFixed(4) }}
            </div>
            <LandmarkMap
              :landmarks="landmarkMarkers"
              :selected-position="selectedPosition"
              class="landmark-detail__map"
            />
          </div>

          <div class="landmark-detail__ratings">
            <div class="landmark-detail__rating-section">
              <h3 class="landmark-detail__rating-title">
                {{ $t('landmark.overallRating') }}
              </h3>
              <div class="landmark-detail__rating-display">
                <span class="landmark-detail__rating-value">
                  {{ landmark.averageRating.toFixed(1) }}
                </span>
                <span class="landmark-detail__rating-star">★</span>
                <span class="landmark-detail__rating-count">
                  ({{ Object.keys(landmark.userRatings || {}).length }}
                  {{ $t('landmark.visits') }})
                </span>
              </div>
            </div>

            <div v-if="canRate" class="landmark-detail__rating-section">
              <h3 class="landmark-detail__rating-title">
                {{ $t('landmark.yourRating') }}
              </h3>
              <div class="landmark-detail__user-rating">
                <div class="landmark-detail__stars">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="landmark-detail__star"
                    :class="{
                      'landmark-detail__star_active': star <= userRating,
                    }"
                    @click="rateLandmark(star)"
                    :disabled="ratingLandmark"
                  >
                    ★
                  </button>
                </div>
                <span class="landmark-detail__user-rating-text">
                  {{ userRating }}/5
                </span>
              </div>
            </div>

            <div v-else class="landmark-detail__rating-section">
              <p class="landmark-detail__admin-notice">
                {{ $t('admin.cannotRate') }}
              </p>
            </div>
          </div>

          <div
            v-if="landmark.photos && landmark.photos.length > 0"
            class="landmark-detail__section"
          >
            <h2 class="landmark-detail__section-title">
              {{ $t('landmark.photos') }}
            </h2>
            <div class="landmark-detail__photos">
              <div
                v-for="(photo, index) in landmark.photos"
                :key="index"
                class="landmark-detail__photo"
              >
                <img
                  :src="photo"
                  :alt="`${landmark.name} photo ${index + 1}`"
                  class="landmark-detail__photo-img"
                  @click="openPhotoViewer(index)"
                />
              </div>
            </div>
          </div>

          <div class="landmark-detail__section" v-if="authStore.isAdmin">
            <h2 class="landmark-detail__section-title">Admin Information</h2>
            <div class="landmark-detail__admin-info">
              <p><strong>Created by:</strong> {{ landmark.createdBy }}</p>
              <p>
                <strong>Created at:</strong>
                {{ formatDate(landmark.createdAt) }}
              </p>
              <p>
                <strong>Total ratings:</strong>
                {{ Object.keys(landmark.userRatings || {}).length }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="photoViewerOpen && landmark"
      class="landmark-detail__photo-viewer"
    >
      <div class="landmark-detail__photo-viewer-content">
        <button
          @click="photoViewerOpen = false"
          class="landmark-detail__photo-viewer-close"
        >
          ×
        </button>
        <button
          @click="prevPhoto"
          class="landmark-detail__photo-nav landmark-detail__photo-nav_prev"
        >
          ‹
        </button>
        <img
          :src="landmark.photos[currentPhotoIndex]"
          :alt="`${landmark.name} photo ${currentPhotoIndex + 1}`"
          class="landmark-detail__photo-viewer-img"
        />
        <button
          @click="nextPhoto"
          class="landmark-detail__photo-nav landmark-detail__photo-nav_next"
        >
          ›
        </button>
        <div class="landmark-detail__photo-counter">
          {{ currentPhotoIndex + 1 }} / {{ landmark.photos.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../stores/auth';
import { useLandmarksStore } from '../stores/landmarks';
import LandmarkMap from '../components/LandmarkMap.vue';
import LandmarkForm from '../components/LandmarkForm.vue';
import type {
  Landmark,
  LandmarkMarker,
  LandmarkFormData,
  MapPosition,
} from '../types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();

const landmark = ref<Landmark | null>(null);
const loading = ref(true);
const editMode = ref(false);
const saving = ref(false);
const ratingLandmark = ref(false);
const photoViewerOpen = ref(false);
const currentPhotoIndex = ref(0);
const deleting = ref(false);

const landmarkId = computed(() => route.params.id as string);

const canEdit = computed(() => {
  return landmark.value && landmarksStore.canEditLandmark(landmark.value);
});

const canDelete = computed(() => {
  return landmark.value && landmarksStore.canDeleteLandmark(landmark.value);
});

const canRate = computed(() => {
  return landmark.value && landmarksStore.canRateLandmark(landmark.value);
});

const userRating = computed(() => {
  if (!landmark.value || !authStore.user) return 0;
  return landmark.value.userRatings?.[authStore.user.uid] || 0;
});

const landmarkMarkers = computed((): LandmarkMarker[] => {
  if (!landmark.value) return [];
  return [
    {
      id: landmark.value.id,
      name: landmark.value.name,
      latitude: landmark.value.latitude,
      longitude: landmark.value.longitude,
      averageRating: landmark.value.averageRating,
    },
  ];
});

const selectedPosition = computed((): MapPosition | null => {
  if (!landmark.value) return null;
  return {
    lat: landmark.value.latitude,
    lng: landmark.value.longitude,
  };
});

function formatDate(date: Date): string {
  return new Date(date).toLocaleString();
}

onMounted(async () => {
  await fetchLandmark();
});

async function fetchLandmark() {
  try {
    loading.value = true;
    const docRef = doc(db, 'landmarks', landmarkId.value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      landmark.value = {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        createdBy: data.createdBy,
        createdAt: data.createdAt.toDate(),
        averageRating: data.averageRating || 0,
        visitCount: data.visitCount || 0,
        photos: data.photos || [],
        userRatings: data.userRatings || {},
      } as Landmark;
    } else {
      console.error('Landmark not found');
    }
  } catch (error) {
    console.error('Error fetching landmark:', error);
  } finally {
    loading.value = false;
  }
}

async function onUpdateLandmark(
  formData: LandmarkFormData & { existingPhotos?: string[] }
) {
  if (!landmark.value) return;

  try {
    saving.value = true;

    await landmarksStore.updateLandmark(
      landmark.value.id,
      formData,
      formData.existingPhotos || []
    );

    await fetchLandmark();

    editMode.value = false;

    alert('Landmark updated successfully!');
  } catch (error) {
    console.error('Error updating landmark:', error);
    alert('Error updating landmark: ' + (error as Error).message);
  } finally {
    saving.value = false;
  }
}

async function rateLandmark(rating: number) {
  if (!authStore.user || !landmark.value) return;

  try {
    ratingLandmark.value = true;
    await landmarksStore.rateLandmark(landmark.value.id, rating);
    await fetchLandmark();
  } catch (error) {
    console.error('Error rating landmark:', error);
    alert('Error rating landmark: ' + (error as Error).message);
  } finally {
    ratingLandmark.value = false;
  }
}

async function deleteLandmark() {
  if (
    !landmark.value ||
    !confirm('Are you sure you want to delete this landmark?')
  ) {
    return;
  }

  try {
    deleting.value = true;
    const landmarkRef = doc(db, 'landmarks', landmark.value.id);
    await deleteDoc(landmarkRef);

    landmarksStore.clearLandmarks();

    router.push('/generalmap');
  } catch (error) {
    console.error('Error deleting landmark:', error);
    alert('Error deleting landmark: ' + (error as Error).message);
  } finally {
    deleting.value = false;
  }
}

function openPhotoViewer(index: number) {
  if (!landmark.value || !landmark.value.photos) return;
  currentPhotoIndex.value = index;
  photoViewerOpen.value = true;
}

function nextPhoto() {
  if (!landmark.value || !landmark.value.photos) return;
  currentPhotoIndex.value =
    (currentPhotoIndex.value + 1) % landmark.value.photos.length;
}

function prevPhoto() {
  if (!landmark.value || !landmark.value.photos) return;
  currentPhotoIndex.value =
    currentPhotoIndex.value === 0
      ? landmark.value.photos.length - 1
      : currentPhotoIndex.value - 1;
}
</script>

<style scoped>
.landmark-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.landmark-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.landmark-detail__back-btn {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.landmark-detail__back-btn:hover {
  background-color: #cbd5e0;
}

.landmark-detail__title {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-align: center;
}

.landmark-detail__title-placeholder {
  flex: 1;
  height: 2rem;
}

.landmark-detail__actions {
  display: flex;
  gap: 0.5rem;
}

.landmark-detail__edit-btn {
  background-color: #48bb78;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.landmark-detail__edit-btn:hover:not(:disabled) {
  background-color: #38a169;
}

.landmark-detail__edit-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.landmark-detail__delete-btn {
  background-color: #e53e3e;
  color: #fff;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.landmark-detail__delete-btn:hover:not(:disabled) {
  background-color: #c53030;
}

.landmark-detail__delete-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.landmark-detail__loading {
  text-align: center;
  padding: 4rem;
  color: #718096;
  font-size: 1.125rem;
}

.landmark-detail__not-found {
  text-align: center;
  padding: 4rem;
  color: #718096;
}

.landmark-detail__back-to-map {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #48bb78;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.landmark-detail__content {
  display: grid;
  gap: 2rem;
}

.landmark-detail__view {
  display: grid;
  gap: 2rem;
}

.landmark-detail__info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.landmark-detail__section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.landmark-detail__section-title {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.landmark-detail__description {
  color: #4a5568;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

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

.landmark-detail__ratings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.landmark-detail__rating-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.landmark-detail__rating-title {
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.landmark-detail__rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.landmark-detail__rating-value {
  color: #2d3748;
  font-size: 2rem;
  font-weight: 700;
}

.landmark-detail__rating-star {
  color: #f6e05e;
  font-size: 2rem;
}

.landmark-detail__rating-count {
  color: #718096;
  font-size: 0.875rem;
}

.landmark-detail__user-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.landmark-detail__stars {
  display: flex;
  gap: 0.25rem;
}

.landmark-detail__star {
  background: none;
  border: none;
  font-size: 2rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0.25rem;
}

.landmark-detail__star:hover:not(:disabled) {
  color: #f6e05e;
}

.landmark-detail__star_active {
  color: #f6e05e;
}

.landmark-detail__star:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.landmark-detail__user-rating-text {
  color: #4a5568;
  font-size: 1.125rem;
  font-weight: 600;
}

.landmark-detail__admin-notice {
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 4px;
  margin: 0;
}

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

.landmark-detail__admin-info {
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #e53e3e;
}

.landmark-detail__admin-info p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.landmark-detail__admin-info strong {
  color: #2d3748;
}

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
  .landmark-detail {
    padding: 1rem;
  }

  .landmark-detail__header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .landmark-detail__title {
    font-size: 1.5rem;
  }

  .landmark-detail__actions {
    justify-content: center;
  }

  .landmark-detail__ratings {
    grid-template-columns: 1fr;
  }

  .landmark-detail__photos {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .landmark-detail__user-rating {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

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

@media (max-width: 480px) {
  .landmark-detail__section {
    padding: 1rem;
  }

  .landmark-detail__photos {
    grid-template-columns: 1fr 1fr;
  }

  .landmark-detail__rating-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
