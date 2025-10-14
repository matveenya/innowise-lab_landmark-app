<template>
  <div class="general-map">
    <header class="general-map__header">
      <div class="general-map__header-content">
        <div class="general-map__brand">
          <h1 class="general-map__title">Landmark</h1>
          <p class="general-map__user">Welcome, {{ userDisplayName }}!</p>
        </div>
        <nav class="general-map__nav">
          <button @click="handleLogout" class="general-map__logout">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="general-map__main">
      <div class="general-map__content">
        <section class="general-map__map-section">
          <div class="general-map__map-test">
            <h3>Test Map Component</h3>
            <LandmarkMap class="test-map" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LandmarkMap from '../components/LandmarkMap.vue';

const authStore = useAuthStore();
const router = useRouter();

const userDisplayName = computed(() => {
  return authStore.user?.displayName || authStore.user?.email;
});

async function handleLogout() {
  await authStore.logout();
  router.push('/signin');
}
</script>

<style scoped>
.general-map {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
}

.general-map__header {
  background-color: #fff;
  border-bottom: 1px solid #48bb78;
  padding: 1rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.general-map__header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.general-map__nav {
  display: flex;
  gap: 1rem;
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
}

.general-map__logout:hover {
  background-color: #c53030;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.general-map__main {
  flex: 1;
}

.general-map__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 20px;
}

.general-map__map-section {
  margin-top: 2rem;
}

.general-map__map-test {
  height: 500px;
  padding: 1rem;
}

.test-map {
  height: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .general-map__header-content {
    padding: 0 15px;
  }

  .general-map__content {
    padding: 1rem 15px;
  }

  .general-map-placeholder {
    height: 400px;
  }

  .general-map__title {
    font-size: 1.25rem;
  }
}
</style>
