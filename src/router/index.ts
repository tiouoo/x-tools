import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/PageNav.vue'),
    },
    {
      path: '/long-link',
      name: 'long-link',
      component: () => import('../views/LongLink.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/404NotFound.vue'),
    },
  ],
});
export default router;
