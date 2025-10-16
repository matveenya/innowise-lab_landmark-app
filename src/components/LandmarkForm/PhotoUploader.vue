<template>
  <div class="landmark-form__group">
    <label class="landmark-form__label">{{ $t('landmark.photos') }}</label>

    <div
      class="landmark-form__dropzone"
      :class="{
        'landmark-form__dropzone_active': isDrag,
        'landmark-form__dropzone_full': allPhotos.length >= MAX_PHOTOS,
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
            @click="$emit('remove-photo', index)"
            class="landmark-form__remove-photo"
          >
            ×
          </button>
          <div v-if="photo.type === 'new'" class="landmark-form__photo-badge">
            New
          </div>
        </div>

        <div
          v-if="allPhotos.length < MAX_PHOTOS"
          class="landmark-form__add-more"
          @click="triggerFileInput"
        >
          + {{ $t('landmark.addMorePhotos') }}
        </div>
      </div>
    </div>

    <p
      v-if="allPhotos.length >= MAX_PHOTOS"
      class="landmark-form__help landmark-form__help_warning"
    >
      {{ $t('landmark.maxPhotos') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PhotoItem } from '../LandmarkForm.vue';

const MAX_PHOTOS = 5;

interface Props {
  allPhotos: PhotoItem[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'add-files', files: File[]): void;
  (e: 'remove-photo', index: number): void;
}

const emit = defineEmits<Emits>();

const isDrag = ref(false);
const fileInput = ref<HTMLInputElement>();

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    emit('add-files', Array.from(target.files));
  }
  target.value = '';
}

function onDrag() {
  if (props.allPhotos.length < MAX_PHOTOS) {
    isDrag.value = true;
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDrag.value = false;

  if (props.allPhotos.length >= MAX_PHOTOS) return;

  if (event.dataTransfer?.files) {
    emit('add-files', Array.from(event.dataTransfer.files));
  }
}

function getPreviewUrl(item: PhotoItem): string {
  if (item.type === 'new' && item.file) {
    return URL.createObjectURL(item.file);
  }
  return item.url || '';
}
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

.landmark-form__help_warning {
  color: #e53e3e;
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
  opacity: 0.7;
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
</style>
