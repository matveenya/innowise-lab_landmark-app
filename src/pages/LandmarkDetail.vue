<template>
  <div class="landmark-detail">
    <LandmarkDetailHeader
      :landmark-name="landmark?.name"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :saving="saving"
      :deleting="deleting"
      @edit="editMode = true"
      @delete="deleteLandmark"
    />

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
          <InfoSection title-key="landmark.description">
            <p class="landmark-detail__description">
              {{ landmark.description }}
            </p>
          </InfoSection>

          <LocationDetails
            :id="landmark.id"
            :name="landmark.name"
            :latitude="landmark.latitude"
            :longitude="landmark.longitude"
            :average-rating="landmark.averageRating"
          />

          <RatingSummary
            :average-rating="landmark.averageRating"
            :rating-count="Object.keys(landmark.userRatings || {}).length"
            :user-rating="userRating"
            :can-rate="canRate"
            :rating-landmark="ratingLandmark"
            @rate="rateLandmark"
          />

          <PhotoGallery
            v-if="landmark.photos && landmark.photos.length > 0"
            :photos="landmark.photos"
            @open-viewer="openPhotoViewer"
          />

          <InfoSection title-key="admin.admin" v-if="authStore.isAdmin">
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
          </InfoSection>
        </div>
      </div>
    </div>

    <PhotoViewer
      v-if="photoViewerOpen && landmark"
      :photos="landmark.photos"
      :current-index="currentPhotoIndex"
      @close="photoViewerOpen = false"
      @next="nextPhoto"
      @prev="prevPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../stores/auth';
import { useLandmarksStore } from '../stores/landmarks';
import LandmarkForm from '../components/LandmarkForm.vue';
import type { Landmark, LandmarkFormData } from '../types';

import LandmarkDetailHeader from '../components/LandmarkDetail/Header.vue';
import InfoSection from '../components/LandmarkDetail/InfoSection.vue';
import LocationDetails from '../components/LandmarkDetail/LocationDetails.vue';
import RatingSummary from '../components/LandmarkDetail/RatingSummary.vue';
import PhotoGallery from '../components/LandmarkDetail/PhotoGallery.vue';
import PhotoViewer from '../components/LandmarkDetail/PhotoViewer.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();

const landmark = ref<Landmark | null>(null);
const loading = ref<boolean>(true);
const editMode = ref<boolean>(false);
const saving = ref<boolean>(false);
const ratingLandmark = ref<boolean>(false);
const photoViewerOpen = ref<boolean>(false);
const currentPhotoIndex = ref<number>(0);
const deleting = ref<boolean>(false);

const landmarkId = computed(() => route.params.id as string);

const canEdit = computed((): boolean => {
  return !!landmark.value && landmarksStore.canEditLandmark(landmark.value);
});

const canDelete = computed((): boolean => {
  return !!landmark.value && landmarksStore.canDeleteLandmark(landmark.value);
});

const canRate = computed((): boolean => {
  return !!landmark.value && landmarksStore.canRateLandmark(landmark.value);
});

const userRating = computed(() => {
  if (!landmark.value || !authStore.user) return 0;
  return landmark.value.userRatings?.[authStore.user.uid] || 0;
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

.landmark-detail__description {
  color: #4a5568;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
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

@media (max-width: 768px) {
  .landmark-detail {
    padding: 1rem;
  }
}
</style>
