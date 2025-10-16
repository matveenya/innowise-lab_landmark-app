<template>
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
          'landmark-form__star_active': star <= modelValue,
        }"
        @click="$emit('update:modelValue', star)"
      >
        ★
      </button>
    </div>
    <span class="landmark-form__rating-text"> {{ modelValue }}/5 </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number;
}

defineProps<Props>();

interface Emits {
  (e: 'update:modelValue', rating: number): void;
}

defineEmits<Emits>();
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

.landmark-form__rating-text {
  color: #718096;
  font-size: 0.875rem;
}
</style>
