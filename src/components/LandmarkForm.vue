<template>
  <div class="landmark-form">
    <form @submit.prevent="handleSubmit" class="landmark-form__form">
      <h2 class="landmark-form__title">
        {{
          isEditing ? $t('landmark.editLandmark') : $t('landmark.addLandmark')
        }}
      </h2>

      <div class="landmark-form__group">
        <label for="name" class="landmark-form__label">{{
          $t('landmark.name')
        }}</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          class="landmark-form__input"
          :placeholder="$t('landmark.name')"
        />
      </div>

      <div class="landmark-form__group">
        <label for="description" class="landmark-form__label">
          {{ $t('landmark.description') }}
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          required
          class="landmark-form__textarea"
          :placeholder="$t('landmark.description')"
          rows="4"
        ></textarea>
      </div>

      <div class="landmark-form__group">
        <label class="landmark-form__label">{{
          $t('landmark.location')
        }}</label>
        <p class="landmark-form__help">{{ $t('landmark.selectLocation') }}</p>
        <LandmarkMap
          :selectable="true"
          :selected-position="selectedPosition"
          @position-select="onPositionSelect"
          class="landmark-form__map"
        />
        <div v-if="!selectedPosition" class="landmark-form__error">
          {{ $t('landmark.noLocationSelected') }}
        </div>
      </div>

      <div class="landmark-form__group">
        <label for="rating" class="landmark-form__label">{{
          $t('landmark.yourRating')
        }}</label>
        <div class="landmark-form__rating">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="landmark-form__star"
            :class="{
              'landmark-form__star_active': star <= formData.userRating,
            }"
            @click="setRating(star)"
          >
            ★
          </button>
        </div>
        <span class="landmark-form__rating-text">
          {{ formData.userRating }}/5
        </span>
      </div>

      <div class="landmark-form__group">
        <label class="landmark-form__label">{{ $t('landmark.photos') }}</label>

        <div
          class="landmark-form__dropzone"
          :class="{
            'landmark-form__dropzone_active': isDrag,
            'landmark-form__dropzone_full': allPhotos.length >= 5,
          }"
          @drop="onDrop"
          @dragover.prevent="onDrag"
          @dragleave="isDrag = false"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="onFileSelect"
            class="landmark-form__file-input"
          />

          <div
            v-if="allPhotos.length === 0"
            class="landmark-form__dropzone-content"
          >
            <p>{{ $t('landmark.dragDropPhotos') }}</p>
            <button
              type="button"
              @click="triggerFileInput"
              class="landmark-form__browse-btn"
            >
              {{ $t('landmark.browseFiles') }}
            </button>
            <p class="landmark-form__help">{{ $t('landmark.maxPhotos') }}</p>
          </div>

          <div v-else class="landmark-form__previews">
            <div
              v-for="(photo, index) in allPhotos"
              :key="index"
              class="landmark-form__preview"
            >
              <img
                :src="getPreviewUrl(photo)"
                :alt="`Preview ${index + 1}`"
                class="landmark-form__preview-img"
              />
              <button
                type="button"
                @click="removePhoto(index)"
                class="landmark-form__remove-photo"
              >
                ×
              </button>
              <div
                v-if="photo.type === 'new'"
                class="landmark-form__photo-badge"
              >
                New
              </div>
            </div>

            <div
              v-if="allPhotos.length < 5"
              class="landmark-form__add-more"
              @click="triggerFileInput"
            >
              + Add More
            </div>
          </div>
        </div>

        <p
          v-if="allPhotos.length >= 5"
          class="landmark-form__help landmark-form__help_warning"
        >
          {{ $t('landmark.maxPhotos') }}
        </p>
      </div>

      <div class="landmark-form__actions">
        <button
          type="button"
          @click="$emit('cancel')"
          class="landmark-form__btn landmark-form__btn_secondary"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="landmark-form__btn landmark-form__btn_primary"
        >
          {{
            loading
              ? $t('common.loading')
              : isEditing
                ? $t('common.save')
                : $t('common.save')
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onUnmounted } from 'vue';
import LandmarkMap from './LandmarkMap.vue';
import type { LandmarkFormData, Landmark } from '../types';
import { useAuthStore } from '../stores/auth';

interface Props {
  landmark?: Landmark | null;
  loading?: boolean;
}

interface Emits {
  (e: 'submit', data: LandmarkFormData & { existingPhotos?: string[] }): void;
  (e: 'cancel'): void;
}

interface PhotoItem {
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
const isDrag = ref(false);
const fileInput = ref<HTMLInputElement>();

const isFormValid = computed(() => {
  return (
    formData.name.trim() &&
    formData.description.trim() &&
    selectedPosition.value &&
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

function setRating(rating: number) {
  formData.userRating = rating;
}

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    handleFiles(Array.from(target.files));
  }
  target.value = '';
}

function onDrag() {
  isDrag.value = true;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDrag.value = false;

  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files));
  }
}

function handleFiles(files: File[]) {
  const remainingSlots = 5 - allPhotos.value.length;
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

.landmark-form__group {
  margin-bottom: 1.5rem;
}

.landmark-form__label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.landmark-form__input,
.landmark-form__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.landmark-form__input:focus,
.landmark-form__textarea:focus {
  outline: none;
  border-color: #48bb78;
}

.landmark-form__textarea {
  resize: vertical;
  min-height: 100px;
}

.landmark-form__help {
  color: #718096;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.landmark-form__help_warning {
  color: #e53e3e;
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

.landmark-form__rating {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.landmark-form__star {
  background: none;
  border: none;
  font-size: 2rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: color 0.3s;
}

.landmark-form__star_active {
  color: #f6e05e;
}

.landmark-form__star:hover {
  color: #f6e05e;
}

.landmark-form__rating_text {
  color: #718096;
  font-size: 0.875rem;
}

.landmark-form__dropzone {
  border: 2px dashed #cbd5e0;
  border-radius: 6px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.landmark-form__dropzone_active {
  border-color: #48bb78;
  background-color: #f0fff4;
}

.landmark-form__dropzone_full {
  cursor: not-allowed;
}

.landmark-form__file-input {
  display: none;
}

.landmark-form__dropzone-content p {
  margin: 0.5rem 0;
  color: #718096;
}

.landmark-form__browse-btn {
  background-color: #48bb78;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0.5rem 0;
}

.landmark-form__browse-btn:hover {
  background-color: #38a169;
}

.landmark-form__previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.landmark-form__preview {
  position: relative;
  aspect-ratio: 1;
}

.landmark-form__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.landmark-form__photo-badge {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #48bb78;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.landmark-form__remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landmark-form__add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 2px dashed #cbd5e0;
  border-radius: 4px;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.5rem;
}

.landmark-form__add-more:hover {
  border-color: #48bb78;
  color: #48bb78;
}

.landmark-form__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.landmark-form__btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.landmark-form__btn_primary {
  background-color: #48bb78;
  color: #fff;
}

.landmark-form__btn_primary:hover:not(:disabled) {
  background-color: #38a169;
}

.landmark-form__btn_primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.landmark-form__btn_secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.landmark-form__btn_secondary:hover {
  background-color: #cbd5e0;
}
</style>
