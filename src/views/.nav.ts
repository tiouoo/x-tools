import type PageNav from '@/types/page-nav';

export const pageItems: PageNav[] = [
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
  {
    title: '时间浪费器',
    path: '/time-waster',
    description: '60秒倒计时',
    component: () => import('@/views/page/TimeWaster.vue'),
  },
  {
    title: '文字反向器',
    path: '/text-reverser',
    description: '输入任意文字瞬间反转显示',
    component: () => import('@/views/page/TextReverser.vue'),
  },
  {
    title: '颜色瞎眼器',
    path: '/color-blinder',
    description: '随机切换刺眼颜色',
    component: () => import('@/views/page/ColorBlinder.vue'),
  },
];
