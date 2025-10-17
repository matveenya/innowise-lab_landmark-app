import { defineStore } from 'pinia';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async initialize() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              this.user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: userData.displayName,
                role: userData.role || 'user',
              };
            }
          } else {
            this.user = null;
          }
          resolve(true);
        });
      });
    },
    async register(email: string, password: string, displayName: string) {
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          displayName,
          role: 'user',
          createdAt: new Date(),
        });

        this.user = {
          uid: userCredential.user.uid,
          email,
          displayName,
          role: 'user',
        };

        return true;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code) {
          this.error = this.getErrorMessage(firebaseError.code);
        } else {
          this.error = 'An unexpected error occurred.';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.user = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            displayName: userData.displayName,
            role: userData.role || 'user',
          };
        }
        return true;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code) {
          this.error = this.getErrorMessage(firebaseError.code);
        } else {
          this.error = 'An unexpected error occurred.';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch {
        this.error = 'An unexpected error occurred.';
      }
    },

    getErrorMessage(errorCode: string): string {
      const errorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 symbols',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };

      return errorMessages[errorCode] || 'An error occurred. Please try again.';
    },
    clearError() {
      this.error = null;
    },
  },
});
