<template>
  <div class="landmark-detail__ratings">
    <div class="landmark-detail__rating-section">
      <h3 class="landmark-detail__rating-title">
        {{ $t('landmark.overallRating') }}
      </h3>
      <div class="landmark-detail__rating-display">
        <span class="landmark-detail__rating-value">
          {{ averageRating.toFixed(1) }}
        </span>
        <span class="landmark-detail__rating-star">★</span>
        <span class="landmark-detail__rating-count">
          ({{ ratingCount }} {{ $t('landmark.visits') }})
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
            @click="$emit('rate', star)"
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
</template>

<script setup lang="ts">
interface Props {
  averageRating: number;
  ratingCount: number;
  userRating: number;
  canRate: boolean;
  ratingLandmark: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'rate', rating: number): void;
}

defineEmits<Emits>();
</script>

<style scoped>
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

@media (max-width: 768px) {
  .landmark-detail__ratings {
    grid-template-columns: 1fr;
  }

  .landmark-detail__user-rating {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .landmark-detail__rating-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
