<template>
  <div class="wrap">
    <div class="card">
      <h1>随机数生成器</h1>
      <p class="lead">设置范围和选项，生成随机数</p>

      <div class="controls">
        <div class="control-row">
          <div class="control-item">
            <label>最小值</label>
            <input type="number" v-model.number="minValue" class="x-input" />
          </div>
          <div class="control-item">
            <label>最大值</label>
            <input type="number" v-model.number="maxValue" class="x-input" />
          </div>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>允许重复</label>
            <label class="switch">
              <input type="checkbox" v-model="allowDuplicate" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>允许小数</label>
            <label class="switch">
              <input type="checkbox" v-model="allowDecimal" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="control-row" v-show="allowDecimal">
          <div class="control-item">
            <label>小数位数</label>
            <input type="number" v-model.number="decimalPlaces" min="1" max="10" class="x-input" />
          </div>
        </div>

        <button @click="generateRandom" class="x-btn generate-btn">生成随机数</button>
      </div>

      <div class="result-section">
        <h2>历史结果</h2>
        <div class="result-display">
          <span v-if="history.length > 0">{{ history.join(' ') }}</span>
          <span v-else class="placeholder">生成结果将显示在这里</span>
        </div>
        <button @click="clearHistory" class="x-btn clear-btn" :disabled="history.length === 0">
          清空历史
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const minValue = ref(1);
const maxValue = ref(100);
const allowDuplicate = ref(false);
const allowDecimal = ref(false);
const decimalPlaces = ref(2);
const history = ref<(number | string)[]>([]);

const generateRandom = () => {
  if (minValue.value >= maxValue.value) {
    message.warning('最小值必须小于最大值');
    return;
  }

  let randomNum: number;

  if (allowDecimal.value) {
    // 生成小数
    randomNum = Math.random() * (maxValue.value - minValue.value) + minValue.value;
    randomNum = Number(randomNum.toFixed(decimalPlaces.value));
  } else {
    // 生成整数
    randomNum = Math.floor(Math.random() * (maxValue.value - minValue.value + 1)) + minValue.value;
  }

  // 检查是否允许重复
  if (!allowDuplicate.value && history.value.includes(randomNum)) {
    // 如果不允许重复且已存在，尝试重新生成
    const maxAttempts = 100;
    let attempts = 0;
    while (history.value.includes(randomNum) && attempts < maxAttempts) {
      if (allowDecimal.value) {
        randomNum = Math.random() * (maxValue.value - minValue.value) + minValue.value;
        randomNum = Number(randomNum.toFixed(decimalPlaces.value));
      } else {
        randomNum =
          Math.floor(Math.random() * (maxValue.value - minValue.value + 1)) + minValue.value;
      }
      attempts++;
    }

    if (attempts >= maxAttempts) {
      message.warning('无法生成不重复的随机数，可能已达到范围上限');
      return;
    }
  }

  history.value.push(randomNum);
  message.success(`生成随机数: ${randomNum}`);
};

const clearHistory = () => {
  history.value = [];
  message.success('已清空历史记录');
};
</script>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 20px;
  overflow: auto;
}

.card {
  width: 100%;
  max-width: 760px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: var(--card-border);
  padding: 28px;
  margin-bottom: 55px;
}

h1 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--text-color, #0f172a);
}

h2 {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-color-light, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.lead {
  margin: 0 0 24px;
  color: var(--text-color-light, #6b7280);
  font-size: 14px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.control-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.switch-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.control-item label {
  font-size: 12px;
  color: var(--text-color-light, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 5px;
}

.x-input {
  padding: 10px 14px;
  border: 1px solid #e6e9ef;
  border-radius: 12px;
  font-size: 14px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  transition: all 0.2s;
}

.x-input:focus {
  outline: none;
  border-color: #667eea;
}

[data-theme='dark'] .x-input {
  border-color: #334155;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

[data-theme='dark'] .slider {
  background-color: #475569;
}

[data-theme='dark'] input:checked + .slider {
  background-color: #764ba2;
}

.generate-btn {
  padding-left: 16px;
  font-size: 15px;
}

.result-section {
  padding-top: 24px;
  border-top: 1px solid #e6e9ef;
}

[data-theme='dark'] .result-section {
  border-top-color: #334155;
}

.result-display {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f6;
  font-size: 14px;
  color: var(--text-color, #0f172a);
  word-wrap: break-word;
  margin-bottom: 12px;
  min-height: 50px;
}

[data-theme='dark'] .result-display {
  background: #1e293b;
  border-color: #334155;
}

.placeholder {
  color: var(--text-color-light, #6b7280);
}

.clear-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #dc2626;
}

.clear-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
