<template>
  <div class="landmark-form">
    <form @submit.prevent="handleSubmit" class="landmark-form__form">
      <h2 class="landmark-form__title">
        {{
          isEditing ? $t('landmark.editLandmark') : $t('landmark.addLandmark')
        }}
      </h2>

      <InputGroup
        id="name"
        :label="$t('landmark.name')"
        :placeholder="$t('landmark.name')"
        v-model="formData.name"
        type="text"
      />

      <InputGroup
        id="description"
        :label="$t('landmark.description')"
        :placeholder="$t('landmark.description')"
        v-model="formData.description"
        type="textarea"
      />

      <MapSelector
        :selected-position="selectedPosition"
        @update:selectedPosition="onPositionSelect"
      />

      <RatingSelector v-model="formData.userRating" />

      <PhotoUploader
        :all-photos="allPhotos"
        @add-files="handleFiles"
        @remove-photo="removePhoto"
      />

      <Actions
        :is-form-valid="isFormValid"
        :loading="props.loading"
        :is-editing="isEditing"
        @cancel="$emit('cancel')"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import type { LandmarkFormData, Landmark } from '../types';

import InputGroup from './LandmarkForm/InputGroup.vue';
import MapSelector from './LandmarkForm/MapSelector.vue';
import RatingSelector from './LandmarkForm/RatingSelector.vue';
import PhotoUploader from './LandmarkForm/PhotoUploader.vue';
import Actions from './LandmarkForm/Actions.vue';

interface Props {
  landmark?: Landmark | null;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: LandmarkFormData & { existingPhotos?: string[] }): void;
  (e: 'cancel'): void;
}

export interface PhotoItem {
  type: 'existing' | 'new';
  file?: File;
  url?: string;
}

const props = withDefaults(defineProps<Props>(), {
  landmark: null,
  loading: false,
});

const emit = defineEmits<Emits>();

const authStore = useAuthStore();

const isEditing = computed(() => !!props.landmark);

const formData = reactive<LandmarkFormData & { existingPhotos?: string[] }>({
  name: '',
  description: '',
  latitude: 0,
  longitude: 0,
  userRating: 0,
  photos: [],
  existingPhotos: [],
});

const selectedPosition = ref<{ lat: number; lng: number } | null>(null);

const isFormValid = computed(() => {
  return (
    !!formData.name.trim() &&
    !!formData.description.trim() &&
    !!selectedPosition.value &&
    formData.userRating > 0 &&
    formData.userRating <= 5
  );
});

const allPhotos = computed((): PhotoItem[] => {
  const existing: PhotoItem[] = (formData.existingPhotos || []).map((url) => ({
    type: 'existing',
    url,
  }));
  const newPhotos: PhotoItem[] = formData.photos.map((file) => ({
    type: 'new',
    file,
  }));
  return [...existing, ...newPhotos];
});

watch(
  () => props.landmark,
  (landmark) => {
    if (landmark) {
      formData.name = landmark.name;
      formData.description = landmark.description;
      formData.userRating =
        landmark.userRatings[authStore.user?.uid || ''] || 0;
      selectedPosition.value = {
        lat: landmark.latitude,
        lng: landmark.longitude,
      };
      formData.latitude = landmark.latitude;
      formData.longitude = landmark.longitude;
      formData.existingPhotos = [...(landmark.photos || [])];
      formData.photos = [];
    } else {
      formData.name = '';
      formData.description = '';
      formData.userRating = 0;
      selectedPosition.value = null;
      formData.latitude = 0;
      formData.longitude = 0;
      formData.photos = [];
      formData.existingPhotos = [];
    }
  },
  { immediate: true }
);

function onPositionSelect(position: { lat: number; lng: number }) {
  selectedPosition.value = position;
  formData.latitude = position.lat;
  formData.longitude = position.lng;
}

function handleFiles(files: File[]) {
  const MAX_PHOTOS = 5;
  const remainingSlots = MAX_PHOTOS - allPhotos.value.length;
  const filesToAdd = files.slice(0, remainingSlots);

  formData.photos.push(...filesToAdd);
}

function getPreviewUrl(item: PhotoItem): string {
  if (item.type === 'new' && item.file) {
    return URL.createObjectURL(item.file);
  }
  return item.url || '';
}

function removePhoto(index: number) {
  const item = allPhotos.value[index];

  if (!item) return;

  if (item.type === 'existing' && formData.existingPhotos) {
    const existingIndex = formData.existingPhotos.indexOf(item.url || '');
    if (existingIndex !== -1) {
      formData.existingPhotos.splice(existingIndex, 1);
    }
  } else if (item.type === 'new' && item.file) {
    const fileIndex = formData.photos.findIndex((photo) => photo === item.file);
    if (fileIndex !== -1) {
      URL.revokeObjectURL(getPreviewUrl(item));
      formData.photos.splice(fileIndex, 1);
    }
  }
}

function handleSubmit() {
  if (!isFormValid.value) return;

  const photosToSubmit = [...formData.photos];

  emit('submit', {
    ...formData,
    photos: photosToSubmit,
    existingPhotos: formData.existingPhotos || [],
  });
}

onUnmounted(() => {
  allPhotos.value.forEach((item) => {
    if (item.type === 'new' && item.file) {
      URL.revokeObjectURL(getPreviewUrl(item));
    }
  });
});
</script>

<style scoped>
.landmark-form {
  max-width: 600px;
  margin: 0 auto;
}

.landmark-form__form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.landmark-form__title {
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}
</style>
