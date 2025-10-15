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
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface MarkerCluster extends L.Marker {
  getAllChildMarkers(): L.Marker[];
  getChildCount(): number;
}

interface ClusterClickEvent extends L.LeafletEvent {
  layer: MarkerCluster;
}

declare module 'leaflet' {
  function markerClusterGroup(options?: {
    chunkedLoading?: boolean;
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: { getChildCount(): number }) => L.DivIcon;
  }): L.LayerGroup;
}

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
  clusterEnabled?: boolean;
}

interface Emits {
  (e: 'marker-click', landmark: LandmarkMarker): void;
  (e: 'position-select', position: MapPosition): void;
  (e: 'cluster-click', landmarks: LandmarkMarker[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  landmarks: () => [],
  selectable: false,
  selectedPosition: null,
  clusterEnabled: true,
});

const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLElement>();
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let clickMarker: L.Marker | null = null;
let markerCluster: L.LayerGroup | null = null;

function clusterIconCreateFunction(cluster: {
  getChildCount(): number;
}): L.DivIcon {
  const count = cluster.getChildCount();
  let size = 'small';

  if (count > 50) {
    size = 'large';
  } else if (count > 10) {
    size = 'medium';
  }

  const html = `
    <div class="marker-cluster marker-cluster-${size}">
      <span>${count}</span>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'marker-cluster-custom',
    iconSize: L.point(40, 40),
  });
}

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

  if (markerCluster && props.clusterEnabled) {
    markerCluster.clearLayers();
  } else {
    markers.forEach((marker) => {
      if (map && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    markers = [];
  }

  props.landmarks.forEach((landmark) => {
    const marker = L.marker([landmark.latitude, landmark.longitude]);

    const popupContent = `
      <div class="landmark-popup">
        <h3>${landmark.name}</h3>
        <p>Rating: ${landmark.averageRating.toFixed(1)}/5</p>
        <button onclick="window.dispatchEvent(new CustomEvent('landmark-click', { detail: '${landmark.id}' }))">
          View Details
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('click', () => {
      emit('marker-click', landmark);
    });

    if (markerCluster && props.clusterEnabled) {
      markerCluster.addLayer(marker);
    } else {
      if (map) {
        marker.addTo(map);
        markers.push(marker);
      }
    }
  });
}

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([51.505, -0.09], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    if (props.clusterEnabled) {
      initializeCluster();
    }

    if (props.selectable) {
      map.on('click', onMapClick);
    }

    updateMarkers();
  }
});

function initializeCluster() {
  if (!map) return;

  markerCluster = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 17,
    iconCreateFunction: clusterIconCreateFunction,
  });

  const clusterWithEvent = markerCluster as L.LayerGroup & {
    on(
      type: string,
      fn: (event: ClusterClickEvent) => void,
      context?: unknown
    ): L.LayerGroup;
  };

  clusterWithEvent.on('clusterclick', (event: ClusterClickEvent) => {
    const clusterMarkers = event.layer.getAllChildMarkers();
    const landmarksInCluster: LandmarkMarker[] = [];

    clusterMarkers.forEach((marker: L.Marker) => {
      const latLng = marker.getLatLng();
      const landmark = props.landmarks.find(
        (l) =>
          Math.abs(l.latitude - latLng.lat) < 0.0001 &&
          Math.abs(l.longitude - latLng.lng) < 0.0001
      );
      if (landmark) {
        landmarksInCluster.push(landmark);
      }
    });

    emit('cluster-click', landmarksInCluster);
  });

  map.addLayer(markerCluster);
}

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

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

watch(
  () => props.clusterEnabled,
  (enabled) => {
    if (!map) return;

    if (enabled && !markerCluster) {
      initializeCluster();
      updateMarkers();
    } else if (!enabled && markerCluster) {
      map.removeLayer(markerCluster);
      markerCluster = null;
      updateMarkers();
    }
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

:deep(.marker-cluster-custom) {
  background-clip: padding-box;
  border-radius: 20px;
}

:deep(.marker-cluster-custom div) {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 15px;
  font:
    12px 'Helvetica Neue',
    Arial,
    Helvetica,
    sans-serif;
}

:deep(.marker-cluster-small) {
  background-color: rgba(181, 226, 140, 0.6);
}

:deep(.marker-cluster-small div) {
  background-color: rgba(110, 204, 57, 0.6);
  color: white;
}

:deep(.marker-cluster-medium) {
  background-color: rgba(241, 211, 87, 0.6);
}

:deep(.marker-cluster-medium div) {
  background-color: rgba(240, 194, 12, 0.6);
  color: white;
}

:deep(.marker-cluster-large) {
  background-color: rgba(253, 156, 115, 0.6);
}

:deep(.marker-cluster-large div) {
  background-color: rgba(241, 128, 23, 0.6);
  color: white;
}
</style>
