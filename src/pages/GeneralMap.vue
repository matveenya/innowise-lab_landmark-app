<template>
  <div class="general-map">
    <header class="general-map__header">
      <div class="general-map__header-content">
        <div class="general-map__brand">
          <h1 class="general-map__title">Landmark</h1>
          <p class="general-map__user">Welcome, {{ userDisplayName }}!</p>
        </div>
        <nav class="general-map__nav">
          <button @click="showAddLandmark = true" class="general-map__add-btn">
            Add Landmark
          </button>
          <button @click="handleLogout" class="general-map__logout">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="general-map__main">
      <div class="general-map__content">
        <section class="general-map__map-section">
          <LandmarkMap
            :landmarks="landmarksStore.landmarks"
            class="general-map__map"
          />
        </section>
      </div>
    </main>

    <div v-if="showAddLandmark" class="general-map__modal">
      <div class="general-map__modal-content">
        <LandmarkForm
          @submit="onAddLandmark"
          @cancel="showAddLandmark = false"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLandmarksStore } from '../stores/landmarks';
import LandmarkMap from '../components/LandmarkMap.vue';
import LandmarkForm from '../components/LandmarkForm.vue';
import type { LandmarkFormData } from '../types';

const authStore = useAuthStore();
const landmarksStore = useLandmarksStore();
const router = useRouter();

const showAddLandmark = ref(false);
const loading = ref(false);

const userDisplayName = computed(() => {
  return authStore.user?.displayName || authStore.user?.email;
});

onMounted(async () => {
  await landmarksStore.fetchLandmarks();
});

async function onAddLandmark(formData: LandmarkFormData) {
  console.log('Received form data in GeneralMap:', formData);
  loading.value = true;

  try {
    const landmarkId = await landmarksStore.addLandmark(formData);
    console.log('Landmark added successfully with ID:', landmarkId);
    showAddLandmark.value = false;

    await landmarksStore.fetchLandmarks();
    console.log('Landmarks after refresh:', landmarksStore.landmarks.length);
  } catch (error) {
    console.error('Error adding landmark:', error);
    alert('Error adding landmark: ' + (error as Error).message);
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  await authStore.logout();
  landmarksStore.clearLandmarks();
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
  align-items: center;
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
}

.general-map__logout:hover {
  background-color: #c53030;
  transform: translateY(-1px);
}

.general-map__main {
  flex: 1;
  padding: 1rem 0;
}

.general-map__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.general-map__map-section {
  height: 600px;
}

.general-map__map {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.general-map__modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.general-map__modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
