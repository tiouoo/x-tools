<template>
  <div class="wrap">
    <div class="card">
      <h1>文字反向器</h1>

      <div class="input-box">
        <textarea
          v-model="inputText"
          placeholder="输入任意文字..."
          class="text-input"
          rows="4"
          @keyup.enter.ctrl="reverseText"></textarea>
      </div>

      <div class="controls-row">
        <button @click="reverseText" class="gen-btn">反转文字</button>
        <button @click="copyText" :disabled="!reversedText" class="copy-btn">复制</button>
      </div>

      <div v-if="reversedText" class="result-box">
        <div class="reversed-display">{{ reversedText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputText = ref('');
const reversedText = ref('');

const reverseText = () => {
  if (!inputText.value.trim()) {
    reversedText.value = '';
    return;
  }
  reversedText.value = inputText.value.split('').reverse().join('');
};

const copyText = async () => {
  if (!reversedText.value) return;

  try {
    await navigator.clipboard.writeText(reversedText.value);
    alert('已复制到剪贴板');
  } catch {
    const input = document.createElement('input');
    input.value = reversedText.value;
    document.body.appendChild(input);
    input.select();
    document.body.removeChild(input);
    alert('已复制到剪贴板');
  }
};
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
}

.card {
  width: 100%;
  max-width: 760px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(16, 24, 40, 0.06);
  padding: 28px;
  margin-bottom: 55px;
}

h1 {
  margin: 0 0 8px;
  font-size: 20px;
  color: var(--text-color, #0f172a);
}

.lead {
  margin: 0 0 24px;
  color: var(--text-color-light, #6b7280);
  font-size: 14px;
}

.input-box {
  margin-bottom: 16px;
}

.text-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  font-size: 15px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;
}

.text-input:focus {
  border-color: #667eea;
}

[data-theme='dark'] .text-input {
  border-color: #334155;
}

[data-theme='dark'] .text-input:focus {
  border-color: #764ba2;
}

.controls-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.gen-btn {
  flex: 1;
  background: #667eea;
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.gen-btn:hover {
  background: #5568d3;
}

.copy-btn {
  background: #10b981;
  color: #fff;
  border: 0;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 100px;
}

.copy-btn:hover:not(:disabled) {
  background: #059669;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-box {
  margin-top: 8px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 12px;
}

[data-theme='dark'] .result-box {
  background: #1e293b;
  border-color: #334155;
}

.reversed-display {
  font-size: 18px;
  color: var(--text-color, #0f172a);
  word-break: break-all;
  line-height: 1.6;
  min-height: 60px;
}
</style>
