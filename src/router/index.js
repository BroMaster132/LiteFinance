import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import Settings from '@/components/Settings.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => Settings
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: () => import('../components/MyExpenses.vue'),
    },
    {
      path: '/myspendings',
      name: 'myspendings',
      component: () => import('../components/MySpendings.vue'),
    },

  ]})

export default router
