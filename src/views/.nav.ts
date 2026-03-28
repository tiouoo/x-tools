import type PageNav from '@/types/page-nav';

export const pageItems: PageNav[] = [
  {
    title: '长链接',
    path: '/long-link',
    description: '把短链接变得超级长通过Ii组成的格式',
    component: () => import('@/views/LongLink.vue'),
  },
  {
    title: '网易我的世界随机名',
    path: '/wy-mc-name',
    description: '生成网易我的世界中国版风格的随机名字',
    component: () => import('@/views/MinecraftName.vue'),
  },
];
