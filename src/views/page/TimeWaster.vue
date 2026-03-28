<template>
  <div class="wrap">
    <div class="countdown-container">
      <div class="countdown-display">{{ displayTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const timeLeft = ref(60);

let timer: number | null = null;

const displayTime = ref('60');

const updateDisplay = () => {
  displayTime.value = timeLeft.value.toString().padStart(2, '0');
};

const startCountdown = () => {
  timer = window.setInterval(() => {
    timeLeft.value--;
    updateDisplay();

    if (timeLeft.value <= 1) {
      timeLeft.value = 61;
    }
  }, 1000);
};

// 阻止所有默认行为
const preventDefaults = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
};

onMounted(() => {
  updateDisplay();
  startCountdown();

  // 屏蔽右键菜单
  document.addEventListener('contextmenu', preventDefaults);

  // 屏蔽所有键盘事件
  document.addEventListener('keydown', preventDefaults);
  document.addEventListener('keyup', preventDefaults);
  document.addEventListener('keypress', preventDefaults);

  // 屏蔽鼠标手势相关事件
  document.addEventListener('mousedown', preventDefaults);
  document.addEventListener('mouseup', preventDefaults);
  document.addEventListener('click', preventDefaults);
  document.addEventListener('dblclick', preventDefaults);
  document.addEventListener('drag', preventDefaults);
  document.addEventListener('dragstart', preventDefaults);
  document.addEventListener('dragend', preventDefaults);
  document.addEventListener('dragover', preventDefaults);
  document.addEventListener('dragenter', preventDefaults);
  document.addEventListener('dragleave', preventDefaults);
  document.addEventListener('drop', preventDefaults);

  // 屏蔽触摸事件
  document.addEventListener('touchstart', preventDefaults);
  document.addEventListener('touchmove', preventDefaults);
  document.addEventListener('touchend', preventDefaults);

  // 屏蔽选择文本
  document.addEventListener('selectstart', preventDefaults);

  // 屏蔽复制粘贴
  document.addEventListener('copy', preventDefaults);
  document.addEventListener('cut', preventDefaults);
  document.addEventListener('paste', preventDefaults);
});

onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer);
  }

  // 移除所有事件监听
  document.removeEventListener('contextmenu', preventDefaults);
  document.removeEventListener('keydown', preventDefaults);
  document.removeEventListener('keyup', preventDefaults);
  document.removeEventListener('keypress', preventDefaults);
  document.removeEventListener('mousedown', preventDefaults);
  document.removeEventListener('mouseup', preventDefaults);
  document.removeEventListener('click', preventDefaults);
  document.removeEventListener('dblclick', preventDefaults);
  document.removeEventListener('drag', preventDefaults);
  document.removeEventListener('dragstart', preventDefaults);
  document.removeEventListener('dragend', preventDefaults);
  document.removeEventListener('dragover', preventDefaults);
  document.removeEventListener('dragenter', preventDefaults);
  document.removeEventListener('dragleave', preventDefaults);
  document.removeEventListener('drop', preventDefaults);
  document.removeEventListener('touchstart', preventDefaults);
  document.removeEventListener('touchmove', preventDefaults);
  document.removeEventListener('touchend', preventDefaults);
  document.removeEventListener('selectstart', preventDefaults);
  document.removeEventListener('copy', preventDefaults);
  document.removeEventListener('cut', preventDefaults);
  document.removeEventListener('paste', preventDefaults);
});
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 55px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.countdown-display {
  font-size: 180px;
  font-weight: 700;
  color: var(--text-color, #0f172a);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .countdown-display {
    font-size: 120px;
  }
}

@media (max-width: 480px) {
  .countdown-display {
    font-size: 80px;
  }
}

/* 暗色主题优化 */
[data-theme='dark'] .countdown-display {
  text-shadow: 0 4px 20px rgba(118, 75, 162, 0.4);
}
</style>
