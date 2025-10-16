<template>
  <div class="landmark-detail__header">
    <button @click="$router.back()" class="landmark-detail__back-btn">
      ← {{ $t('landmark.backToMap') }}
    </button>

    <template v-if="landmarkName">
      <h1 class="landmark-detail__title">{{ landmarkName }}</h1>
      <div v-if="canEdit" class="landmark-detail__actions">
        <button
          @click="$emit('edit')"
          class="landmark-detail__edit-btn"
          :disabled="saving"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          v-if="canDelete"
          @click="$emit('delete')"
          class="landmark-detail__delete-btn"
          :disabled="deleting"
        >
          {{ deleting ? $t('common.loading') : $t('common.delete') }}
        </button>
      </div>
    </template>
    <div v-else class="landmark-detail__title-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  landmarkName: string | undefined;
  canEdit: boolean;
  canDelete: boolean;
  saving: boolean;
  deleting: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'edit'): void;
  (e: 'delete'): void;
}

defineEmits<Emits>();
</script>

<style scoped>
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

@media (max-width: 768px) {
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
}
</style>
