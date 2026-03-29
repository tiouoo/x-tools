import type PageNav from '@/types/page-nav';

export const pageItems: PageNav[] = [
  {
    title: '颜色选取',
    path: '/color-picker',
    description: '颜色选取器',
    component: () => import('@/views/page/ColorPicker.vue'),
  },
];
