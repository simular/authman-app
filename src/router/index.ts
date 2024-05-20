import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/pages/accounts',
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
  },
  {
    path: '/auth/registration',
    name: 'registration',
    component: () => import('@/views/auth/RegistrationPage.vue'),
  },
  {
    path: '/lock',
    name: 'lock',
    component: () => import('@/views/LockScreen.vue'),
  },
  {
    path: '/pages/',
    component: () => import('@/views/MainPage.vue'),
    children: [
      {
        path: '',
        redirect: '/pages/accounts',
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/views/AccountsPage.vue'),
      },
      {
        path: 'options',
        name: 'options',
        component: () => import('@/views/OptionsPage.vue'),
      },
      {
        path: 'password/change',
        name: 'password-change',
        component: () => import('@/views/user/PasswordChangePage.vue'),
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/options/AboutPage.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/options/ProfilePage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
