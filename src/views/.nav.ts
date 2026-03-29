import type PageNav from '@/types/page-nav';

export const pageItems: PageNav[] = [
  {
    title: '颜色选取',
    path: '/color-picker',
    description: '颜色选取器',
    component: () => import('@/views/page/ColorPicker.vue'),
  },
  {
    title: '随机数生成',
    path: '/random-number',
    description: '随机数生成器',
    component: () => import('@/views/page/RandomNumber.vue'),
  },
  {
    title: 'Cloudflare DNS',
    path: '/cloudflare-dns',
    description: 'Cloudflare CNAME 记录管理',
    component: () => import('@/views/page/CloudflareDNS.vue'),
  },
  {
    title: '长链接',
    path: '/long-link',
    description: '把短链接变得超级长通过Ii组成的格式',
    component: () => import('@/views/page/LongLink.vue'),
  },
  {
    title: '网易我的世界随机名',
    path: '/wy-mc-name',
    description: '生成网易我的世界中国版风格的随机名字',
    component: () => import('@/views/page/MinecraftName.vue'),
  },
];
