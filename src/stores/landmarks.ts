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
  updateDoc,
  limit,
  startAfter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Landmark, LandmarkFormData } from '../types';
import { useAuthStore } from './auth';

function calculateScore(averageRating: number, visitCount: number): number {
  const k = 0.1;
  return averageRating * (1 - Math.exp(-k * visitCount));
}

export const useLandmarksStore = defineStore('landmarks', {
  state: () => {
    return {
      landmarks: [] as Landmark[],
      userLandmarks: [] as Landmark[],
      loading: false,
      lastVisible: null as DocumentSnapshot | null,
      hasMore: true,
      pageSize: 10,
    };
  },

  getters: {
    topLandmarks: (state) => {
      return state.landmarks
        .map((landmark) => ({
          ...landmark,
          score: calculateScore(landmark.averageRating, landmark.visitCount),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    },

    paginatedLandmarks: (state) => {
      return state.landmarks
        .map((landmark) => ({
          ...landmark,
          score: calculateScore(landmark.averageRating, landmark.visitCount),
        }))
        .sort((a, b) => b.score - a.score);
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
          const timestamp = Date.now();
          const fileName = `${timestamp}_${photo.name}`;
          const storageRef = ref(storage, `landmarks/${fileName}`);

          const snapshot = await uploadBytes(storageRef, photo);
          const url = await getDownloadURL(snapshot.ref);
          photosUrls.push(url);
        }

        const landmarkData = {
          name: formData.name,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
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
          name: landmarkData.name,
          description: landmarkData.description,
          latitude: landmarkData.latitude,
          longitude: landmarkData.longitude,
          createdBy: landmarkData.createdBy,
          createdAt: landmarkData.createdAt,
          averageRating: landmarkData.averageRating,
          visitCount: landmarkData.visitCount,
          photos: landmarkData.photos,
          userRatings: landmarkData.userRatings,
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
          q = query(
            collection(db, 'landmarks'),
            orderBy('createdAt', 'desc'),
            limit(this.pageSize)
          );
        }

        const querySnapshot = await getDocs(q);
        const landmarks: Landmark[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          landmarks.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            createdBy: data.createdBy,
            createdAt: data.createdAt.toDate(),
            averageRating: data.averageRating,
            visitCount: data.visitCount,
            photos: data.photos || [],
            userRatings: data.userRatings || {},
          } as Landmark);
        });

        if (showOnlyUserLandmarks) {
          this.userLandmarks = landmarks;
        } else {
          this.landmarks = landmarks;
          this.lastVisible =
            querySnapshot.docs[querySnapshot.docs.length - 1] || null;
          this.hasMore = landmarks.length === this.pageSize;
        }
      } catch (error) {
        console.error('Error fetching Landmarks:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchMoreLandmarks() {
      if (!this.hasMore || this.loading) return;

      this.loading = true;
      try {
        let q;
        if (this.lastVisible) {
          q = query(
            collection(db, 'landmarks'),
            orderBy('createdAt', 'desc'),
            startAfter(this.lastVisible),
            limit(this.pageSize)
          );
        } else {
          q = query(
            collection(db, 'landmarks'),
            orderBy('createdAt', 'desc'),
            limit(this.pageSize)
          );
        }

        const querySnapshot = await getDocs(q);
        const newLandmarks: Landmark[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          newLandmarks.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            latitude: data.latitude,
            longitude: data.longitude,
            createdBy: data.createdBy,
            createdAt: data.createdAt.toDate(),
            averageRating: data.averageRating,
            visitCount: data.visitCount,
            photos: data.photos || [],
            userRatings: data.userRatings || {},
          } as Landmark);
        });

        this.landmarks.push(...newLandmarks);
        this.lastVisible =
          querySnapshot.docs[querySnapshot.docs.length - 1] || null;
        this.hasMore = newLandmarks.length === this.pageSize;
      } catch (error) {
        console.error('Error fetching more landmarks:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async rateLandmark(landmarkId: string, rating: number) {
      const authStore = useAuthStore();
      if (!authStore.user) throw new Error('User not authenticated');

      try {
        const landmarkRef = doc(db, 'landmarks', landmarkId);
        const landmarkDoc = await getDoc(landmarkRef);

        if (!landmarkDoc.exists()) {
          throw new Error('Landmark not found');
        }

        const landmarkData = landmarkDoc.data();
        const updatedUserRatings = {
          ...landmarkData.userRatings,
          [authStore.user.uid]: rating,
        };

        const ratings = Object.values(updatedUserRatings) as number[];
        const newAverageRating =
          ratings.reduce((sum: number, r: number) => sum + r, 0) /
          ratings.length;

        const newVisitCount = Math.max(landmarkData.visitCount, ratings.length);

        await updateDoc(landmarkRef, {
          averageRating: parseFloat(newAverageRating.toFixed(2)),
          visitCount: newVisitCount,
          userRatings: updatedUserRatings,
        });

        const landmarkIndex = this.landmarks.findIndex(
          (l) => l.id === landmarkId
        );
        if (landmarkIndex !== -1) {
          this.landmarks[landmarkIndex] = Object.assign(
            {},
            this.landmarks[landmarkIndex],
            {
              averageRating: parseFloat(newAverageRating.toFixed(2)),
              visitCount: newVisitCount,
              userRatings: updatedUserRatings,
            }
          );
        }

        const userLandmarkIndex = this.userLandmarks.findIndex(
          (l) => l.id === landmarkId
        );
        if (userLandmarkIndex !== -1) {
          this.userLandmarks[userLandmarkIndex] = Object.assign(
            {},
            this.userLandmarks[userLandmarkIndex],
            {
              averageRating: parseFloat(newAverageRating.toFixed(2)),
              visitCount: newVisitCount,
              userRatings: updatedUserRatings,
            }
          );
        }

        return true;
      } catch (error) {
        console.error('Error rating landmark:', error);
        throw error;
      }
    },

    clearLandmarks() {
      this.landmarks = [];
      this.userLandmarks = [];
      this.lastVisible = null;
      this.hasMore = true;
    },
  },
});
