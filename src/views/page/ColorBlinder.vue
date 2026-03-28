<template>
  <div class="wrap"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let colorInterval: number | null = null;
let overlayElement: HTMLDivElement | null = null;

// 生成高饱和度、高亮度的刺眼颜色
const generateEyeHurtColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 85 + Math.floor(Math.random() * 15); // 85-100%
  const lightness = 50 + Math.floor(Math.random() * 25); // 50-75%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 创建全屏覆盖层
const createOverlay = () => {
  // 检查是否已存在覆盖层
  let overlay = document.getElementById('color-blinder-overlay') as HTMLDivElement;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'color-blinder-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
      transition: background-color 0.3s ease, color 0.3s ease;
    `;
    document.body.appendChild(overlay);
  }

  overlayElement = overlay;
  return overlay;
};

// 开始疯狂切换颜色
const startColorChaos = () => {
  const overlay = createOverlay();

  // 隐藏body滚动条
  document.body.style.overflow = 'hidden';

  // 立即显示第一次颜色
  overlay.style.backgroundColor = generateEyeHurtColor();
  overlay.style.color = generateEyeHurtColor();

  // 每300ms切换一次颜色
  colorInterval = window.setInterval(() => {
    const bgColor = generateEyeHurtColor();
    const textColor = generateEyeHurtColor();

    overlay.style.backgroundColor = bgColor;
    overlay.style.color = textColor;
  }, 100);
};

// 停止并清理
const stopColorChaos = () => {
  if (colorInterval !== null) {
    clearInterval(colorInterval);
    colorInterval = null;
  }

  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }

  // 恢复body滚动条
  document.body.style.overflow = '';
};

onMounted(() => {
  startColorChaos();
});

onUnmounted(() => {
  stopColorChaos();
});
</script>

<style scoped>
.wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
