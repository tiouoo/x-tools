import { createRouter, createWebHistory } from 'vue-router';
import { pageItems } from '@/views/.nav';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PageNav.vue'),
    },
    ...pageItems.map((item) => ({
      path: item.path,
      name: item.path.slice(1),
      component: item.component,
    })),
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/404NotFound.vue'),
    },
  ],
});
export default router;
