<template>
  <div class="landmark-detail__section">
    <h2 class="landmark-detail__section-title">
      {{ $t(titleKey) }}
    </h2>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  titleKey: string;
}

defineProps<Props>();
</script>

<style scoped>
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

@media (max-width: 480px) {
  .landmark-detail__section {
    padding: 1rem;
  }
}
</style>
