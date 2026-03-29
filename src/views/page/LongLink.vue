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
        <button @click="generateLongLink" class="x-a-btn">生成长链接</button>
      </div>

      <div v-if="shortUrl" class="out">
        <textarea v-model="shortUrl" readonly class="out-link" rows="2"></textarea>
        <div class="controls">
          <button @click="copyToClipboard" class="secondary x-s-btn">复制</button>
          <button @click="openLink" class="x-a-btn">打开</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';

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
    message.error('错误: 无效的 url');
    shortUrl.value = '';
    return;
  }

  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'http://' + longUrl;
  }

  try {
    const encodedUrl = encodeToBase2(longUrl);
    shortUrl.value = `https://lu.yik.at/${encodedUrl}`;
    message.success('长链接生成成功！');
  } catch {
    message.error('错误: 无效的 url');
    console.error('Encoding error');
    shortUrl.value = '';
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);
    message.success('已复制到剪贴板');
  } catch {
    const input = document.createElement('input');
    input.value = shortUrl.value;
    document.body.appendChild(input);
    input.select();
    document.body.removeChild(input);
    message.success('已复制到剪贴板');
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

.lead {
  margin: 0 0 18px;
  color: var(--text-color-light, #6b7280);
  font-size: 14px;
}

.row {
  display: flex;
  gap: 12px;
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
  padding: 14px 16px;
  border-radius: 12px;
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
