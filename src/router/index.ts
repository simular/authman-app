import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/pages/accounts'
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue')
  },
  {
    path: '/auth/registration',
    name: 'registration',
    component: () => import('@/views/auth/RegistrationPage.vue')
  },
  {
    path: '/pages/',
    component: () => import('@/views/MainPage.vue'),
    children: [
      {
        path: '',
        redirect: '/pages/accounts'
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/views/AccountsPage.vue')
      },
      {
        path: 'options',
        name: 'options',
        component: () => import('@/views/OptionsPage.vue')
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
