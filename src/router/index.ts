import { createRouter, createWebHistory } from 'vue-router';
import SignIn from '../pages/SignIn.vue';
import Register from '../pages/Register.vue';
import GeneralMap from '../pages/GeneralMap.vue';

const routes = [
  {
    path: '/',
    redirect: '/signin',
  },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/generalmap',
    name: 'generalmap',
    component: GeneralMap,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
