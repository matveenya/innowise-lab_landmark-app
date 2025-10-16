<template>
  <div
    class="landmark-card"
    :class="{ 'landmark-card_active': isActive }"
    @click="$emit('view-details', landmark)"
  >
    <div class="landmark-card__header">
      <h3 class="landmark-card__title">
        {{ landmark.name }}
      </h3>
      <div class="landmark-card__rating">
        <span class="landmark-card__rating-value">
          {{ landmark.averageRating.toFixed(1) }}
        </span>
        <span class="landmark-card__rating-star">★</span>
      </div>
    </div>

    <div class="landmark-card__meta">
      <span class="landmark-card__visits">
        {{ landmark.visitCount }} {{ $t('landmark.visits') }}
      </span>
      <span class="landmark-card__score" v-if="!showOnlyUserLandmarks">
        {{ $t('landmark.score') }}:
        {{
          calculateScore(landmark.averageRating, landmark.visitCount).toFixed(2)
        }}
      </span>
      <span class="landmark-card__owner" v-if="showOwnerInfo">
        {{ getOwnerDisplayName }}
      </span>
    </div>

    <div class="landmark-card__actions">
      <div class="landmark-card__user-rating">
        <span class="landmark-card__rating-label"
          >{{ $t('landmark.yourRating') }}:</span
        >
        <div class="landmark-card__stars">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="landmark-card__star"
            :class="{
              'landmark-card__star_active': star <= userRating,
              'landmark-card__star_clickable': canRate,
            }"
            @click.stop="$emit('rate-landmark', landmark, star)"
            :disabled="!canRate || loading"
          >
            ★
          </button>
        </div>
        <span v-if="!canRate" class="landmark-card__admin-notice">
          {{ $t('admin.cannotRate') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Landmark } from '../../types';
import { useAuthStore } from '../../stores/auth';
import { useLandmarksStore } from '../../stores/landmarks';

interface Props {
  landmark: Landmark;
  isActive: boolean;
  showOnlyUserLandmarks: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'view-details', landmark: Landmark): void;
  (e: 'rate-landmark', landmark: Landmark, rating: number): void;
}

defineEmits<Emits>();

const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();

const loading = computed(() => landmarksStore.loading);

function calculateScore(averageRating: number, visitCount: number): number {
  const k = 0.1;
  return averageRating * (1 - Math.exp(-k * visitCount));
}

const userRating = computed((): number => {
  if (!authStore.user) return 0;
  return props.landmark.userRatings?.[authStore.user.uid] || 0;
});

const canRate = computed((): boolean => {
  return landmarksStore.canRateLandmark(props.landmark);
});

const showOwnerInfo = computed((): boolean => {
  return authStore.isAdmin || props.landmark.createdBy !== authStore.user?.uid;
});

const getOwnerDisplayName = computed((): string => {
  if (props.landmark.createdBy === authStore.user?.uid) {
    return 'Your landmark';
  }
  return 'Other user';
});
</script>

<style scoped>
.landmark-card {
  background-color: #fff;
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
  background-color: #f0fff4;
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
  background-color: #48bb78;
  color: #fff;
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
  flex-wrap: wrap;
  gap: 0.5rem;
}

.landmark-card__visits {
  font-size: 0.75rem;
  color: #718096;
}

.landmark-card__score {
  font-size: 0.75rem;
  color: #718096;
}

.landmark-card__owner {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
  flex-basis: 100%;
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
  flex-wrap: wrap;
  gap: 0.5rem;
}

.landmark-card__rating-label {
  font-size: 0.75rem;
  color: #718096;
  flex-basis: 100%;
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

.landmark-card__admin-notice {
  font-size: 0.75rem;
  color: #718096;
  font-style: italic;
  flex-basis: 100%;
  text-align: center;
  padding: 0.25rem;
  background-color: #f7fafc;
  border-radius: 4px;
}
@media (max-width: 768px) {
  .landmark-card__user-rating {
    flex-direction: column;
    align-items: stretch;
  }

  .landmark-card__stars {
    justify-content: center;
  }
}
</style>
