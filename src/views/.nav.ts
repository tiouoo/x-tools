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
];
