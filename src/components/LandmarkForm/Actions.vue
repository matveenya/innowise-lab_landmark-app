<template>
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
</template>

<script setup lang="ts">
interface Props {
  isFormValid: boolean;
  loading: boolean;
  isEditing: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'cancel'): void;
}

defineEmits<Emits>();
</script>

<style scoped>
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
