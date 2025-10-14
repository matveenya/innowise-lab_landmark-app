import { defineStore } from 'pinia';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  getDoc,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Landmark, LandmarkFormData } from '../types';
import { useAuthStore } from './auth';

export const useLandmarksStore = defineStore('landmarks', {
  state: () => {
    return {
      landmarks: [] as Landmark[],
      userLandmarks: [] as Landmark[],
      topLandmarks: [] as Landmark[],
      loading: false,
      lastVisible: null as DocumentSnapshot | null,
      hasMore: true,
    };
  },
  getters: {
    calculateScore:
      () =>
      (averageRating: number, visitCount: number): number => {
        const k = 0.1;
        return averageRating * (1 - Math.exp(-k * visitCount));
      },
  },
  actions: {
    async addLandmark(formData: LandmarkFormData) {
      const authStore = useAuthStore();
      if (!authStore.user) throw new Error('User not authenticated');

      this.loading = true;
      try {
        const photosUrls: string[] = [];
        for (const photo of formData.photos) {
          const storageRef = ref(
            storage,
            `landmarks/${Date.now()}_${photo.name}`
          );
          const snapshot = await uploadBytes(storageRef, photo);
          const url = await getDownloadURL(snapshot.ref);
          photosUrls.push(url);
        }

        const landmarkData = {
          name: formData.name,
          description: formData.description,
          latitude: formData.latitude,
          longtitude: formData.longtitude,
          createdBy: authStore.user.uid,
          createdAt: new Date(),
          averageRating: formData.userRating,
          visitCount: 1,
          photos: photosUrls,
          userRatings: {
            [authStore.user.uid]: formData.userRating,
          },
        };

        const docRef = await addDoc(collection(db, 'landmarks'), landmarkData);

        const newLandmark: Landmark = {
          id: docRef.id,
          ...landmarkData,
        };

        this.landmarks.unshift(newLandmark);
        return docRef.id;
      } catch (error) {
        console.error('Error adding landmark:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchLandmarks(showOnlyUserLandmarks = false) {
      const authStore = useAuthStore();
      this.loading = true;

      try {
        let q;
        if (showOnlyUserLandmarks && authStore.user) {
          q = query(
            collection(db, 'landmarks'),
            where('createdBy', '==', authStore.user.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(collection(db, 'landmarks'), orderBy('createdAt', 'desc'));
        }

        const querySnapshot = await getDocs(q);
        const landmarks: Landmark[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          landmarks.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Landmark);
        });

        if (showOnlyUserLandmarks) {
          this.userLandmarks = landmarks;
        } else {
          this.landmarks = landmarks;
        }
      } catch (error) {
        console.error('Error fetching Landmarks:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchLandmarkById(id: string): Promise<Landmark | null> {
      try {
        const docRef = doc(db, 'landmarks', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Landmark;
        }
        return null;
      } catch (error) {
        console.error('Error fetching landmark:', error);
        return null;
      }
    },

    clearLandmarks() {
      this.landmarks = [];
      this.userLandmarks = [];
      this.topLandmarks = [];
      this.lastVisible = null;
      this.hasMore = true;
    },
  },
});
