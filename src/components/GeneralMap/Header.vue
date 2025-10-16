<template>
  <header class="general-map__header">
    <div class="general-map__header-content">
      <div class="general-map__brand">
        <h1 class="general-map__title">{{ $t('landmark.landmarks') }}</h1>
        <p class="general-map__user">
          {{ $t('welcome') }}, {{ userDisplayName }}!
          <span v-if="authStore.isAdmin" class="general-map__admin-badge">
            ({{ $t('admin.admin') }})
          </span>
        </p>
      </div>
      <nav class="general-map__nav">
        <LanguageSwitcher class="general-map__language-switcher" />
        <div class="general-map__filters">
          <label class="general-map__filter-label">
            <input
              type="checkbox"
              :checked="showOnlyUserLandmarks"
              @change="handleChange"
              class="general-map__checkbox"
            />
            {{ $t('landmark.showOnlyMyLandmarks') }}
          </label>
        </div>
        <button @click="$emit('add-landmark')" class="general-map__add-btn">
          {{ $t('landmark.addLandmark') }}
        </button>
        <button @click="$emit('logout')" class="general-map__logout">
          {{ $t('auth.logout') }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import LanguageSwitcher from '../LanguageSwitcher.vue';

interface Props {
  showOnlyUserLandmarks: boolean;
}

const props = defineProps<Props>();
console.log(props);

interface Emits {
  (e: 'update:showOnlyUserLandmarks', value: boolean): void;
  (e: 'add-landmark'): void;
  (e: 'logout'): void;
  (e: 'filter-change'): void;
}

const emit = defineEmits<Emits>();

const authStore = useAuthStore();

const userDisplayName = computed(() => {
  return authStore.user?.displayName || authStore.user?.email;
});

function handleChange(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked;
  emit('update:showOnlyUserLandmarks', isChecked);
  emit('filter-change');
}
</script>

<style scoped>
.general-map__header {
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.general-map__header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.general-map__brand {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.general-map__title {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.general-map__user {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.general-map__admin-badge {
  background-color: #e53e3e;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.general-map__nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.general-map__filters {
  display: flex;
  align-items: center;
}

.general-map__filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
}

.general-map__checkbox {
  width: 1rem;
  height: 1rem;
}

.general-map__add-btn {
  padding: 0.5rem 1.5rem;
  background-color: #48bb78;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.general-map__add-btn:hover {
  background-color: #38a169;
  transform: translateY(-1px);
}

.general-map__logout {
  padding: 0.5rem 1.5rem;
  background-color: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.general-map__logout:hover {
  background-color: #c53030;
  transform: translateY(-1px);
}

.general-map__language-switcher {
  margin-right: 1rem;
}

@media (max-width: 1024px) {
  .general-map__header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .general-map__nav {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .general-map__nav {
    flex-direction: column;
    gap: 1rem;
  }

  .general-map__filters {
    order: -1;
    justify-content: center;
  }
}
</style>
