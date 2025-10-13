import { createRouter, createWebHistory } from 'vue-router';
import SignIn from '../pages/SignIn.vue';
import Register from '../pages/Register.vue';
import GeneralMap from '../pages/GeneralMap.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/signin',
  },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { reqiresGuest: true },
  },
  {
    path: '/generalmap',
    name: 'generalmap',
    component: GeneralMap,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.user) {
    await authStore.initialize();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/signin');
  } else if (to.meta.requireGuest && authStore.isAuthenticated) {
    next('/generalmap');
  } else {
    next();
  }
});

export default router;
