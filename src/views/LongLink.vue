<template>
  <div class="wrap">
    <div class="card">
      <h1>长链接生成器</h1>
      <div class="row">
        <input
          v-model="inputUrl"
          type="url"
          placeholder="https://example.com"
          @keyup.enter="generateLongLink"
          class="url-input" />
        <button @click="generateLongLink" class="gen-btn">生成长链接</button>
      </div>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

      <div v-if="shortUrl" class="out">
        <textarea v-model="shortUrl" readonly class="out-link" rows="2"></textarea>
        <div class="controls">
          <button @click="copyToClipboard" class="secondary">复制</button>
          <button @click="openLink">打开</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputUrl = ref('');
const shortUrl = ref('');
const errorMsg = ref('');

// Base2 编码函数 (0 -> i, 1 -> I)
function encodeToBase2(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binaryString = '';

  for (let i = 0; i < data.length; i++) {
    binaryString += data[i].toString(2).padStart(8, '0');
  }

  return binaryString.replace(/0/g, 'i').replace(/1/g, 'I');
}

const generateLongLink = () => {
  errorMsg.value = '';
  let longUrl = inputUrl.value.trim();

  if (!longUrl) {
    errorMsg.value = '错误: 无效的 url';
    shortUrl.value = '';
    return;
  }

  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'http://' + longUrl;
  }

  try {
    const encodedUrl = encodeToBase2(longUrl);
    shortUrl.value = `https://lu.yik.at/${encodedUrl}`;
  } catch {
    errorMsg.value = '错误: 无效的 url';
    console.error('Encoding error');
    shortUrl.value = '';
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);
    alert('已复制到剪贴板');
  } catch {
    const input = document.createElement('input');
    input.value = shortUrl.value;
    document.body.appendChild(input);
    input.select();
    document.body.removeChild(input);
  }
};

const openLink = () => {
  if (shortUrl.value) {
    window.open(shortUrl.value, '_blank');
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
  margin: 0 0 18px;
  color: var(--text-color-light, #6b7280);
  font-size: 14px;
}

.row {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  font-size: 15px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #2563eb;
}

[data-theme='dark'] .url-input {
  border-color: #334155;
}

[data-theme='dark'] .url-input:focus {
  border-color: #3b82f6;
}

button {
  background: #2563eb;
  color: #fff;
  border: 0;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.2s;
}

button:hover {
  background: #1d4ed8;
}

button.secondary {
  background: #eef2ff;
  color: #1e293b;
}

button.secondary:hover {
  background: #e0e7ff;
}

[data-theme='dark'] button.secondary {
  background: #1e293b;
  color: #e2e8f0;
}

[data-theme='dark'] button.secondary:hover {
  background: #334155;
}

.error {
  margin: 10px 0 0;
  color: #dc2626;
  font-size: 14px;
}

.out {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  display: flex;
  gap: 8px;
  align-items: center;
}

[data-theme='dark'] .out {
  background: #1e293b;
  border-color: #334155;
}

.out-link {
  border: 0;
  background: transparent;
  flex: 1;
  font-size: 14px;
  color: #064e3b;
  outline: none;
  font-family: monospace;
  resize: none;
  line-height: 1.5;
  overflow-y: auto;
}

[data-theme='dark'] .out-link {
  color: #86efac;
}

.controls {
  display: flex;
  gap: 8px;
}
</style>
