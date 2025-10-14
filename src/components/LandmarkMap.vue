<template>
  <div class="landmark-map">
    <div ref="mapContainer" class="landmark-map__container"></div>
    <div v-if="selectedPosition" class="landmark-map__position-info">
      Selected: {{ selectedPosition.lat.toFixed(4) }},
      {{ selectedPosition.lng.toFixed(4) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const iconDefault = L.Icon.Default.prototype as L.Icon.Default;
if ('_getIconUrl' in iconDefault) {
  delete (iconDefault as unknown as { _getIconUrl?: unknown })._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LandmarkMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
}

interface MapPosition {
  lat: number;
  lng: number;
}

interface Props {
  landmarks?: LandmarkMarker[];
  selectable?: boolean;
  selectedPosition?: MapPosition | null;
}

interface Emits {
  (e: 'marker-click', landmark: LandmarkMarker): void;
  (e: 'position-select', position: MapPosition): void;
}

const props = withDefaults(defineProps<Props>(), {
  landmarks: () => [],
  selectable: false,
  selectedPosition: null,
});

const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLElement>();
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let clickMarker: L.Marker | null = null;

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([51.505, -0.09], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (props.selectable) {
      map.on('click', onMapClick);
    }

    updateMarkers();
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

function onMapClick(event: L.LeafletMouseEvent) {
  if (!map || !props.selectable) return;

  const { lat, lng } = event.latlng;

  if (clickMarker) {
    map.removeLayer(clickMarker);
  }

  clickMarker = L.marker([lat, lng]).addTo(map);

  emit('position-select', { lat, lng });
}

function updateMarkers() {
  if (!map) return;

  markers.forEach((marker) => map!.removeLayer(marker));
  markers = [];

  props.landmarks.forEach((landmark) => {
    const marker = L.marker([landmark.latitude, landmark.longitude]).addTo(map!)
      .bindPopup(`
        <div class="landmark-popup">
          <h3>${landmark.name}</h3>
          <p>Rating: ${landmark.averageRating.toFixed(1)}/5</p>
          <button onclick="window.dispatchEvent(new CustomEvent('landmark-click', { detail: '${landmark.id}' }))">
            View Details
          </button>
        </div>
      `);

    marker.on('click', () => {
      emit('marker-click', landmark);
    });

    markers.push(marker);
  });
}

watch(() => props.landmarks, updateMarkers, { deep: true });

watch(
  () => props.selectedPosition,
  (newPos) => {
    if (!map || !newPos) return;

    if (clickMarker) {
      map.removeLayer(clickMarker);
    }

    clickMarker = L.marker([newPos.lat, newPos.lng]).addTo(map);
    map.setView([newPos.lat, newPos.lng], 13);
  }
);
</script>

<style scoped>
.landmark-map {
  height: 100%;
  position: relative;
}

.landmark-map__container {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}

.landmark-map__position-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 12px;
}
</style>
