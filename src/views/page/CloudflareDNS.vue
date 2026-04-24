<template>
  <div class="wrap">
    <div class="card">
      <h1>Cloudflare DNS 管理</h1>
      <p class="lead">添加 CNAME 记录到你的 Cloudflare 域名</p>

      <div class="controls">
        <div class="control-item">
          <label>API Token</label>
          <input
            type="password"
            v-model="apiToken"
            placeholder="输入你的 Cloudflare API Token"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint"> 在 Cloudflare 控制台创建 API Token，需要 Zone.DNS 编辑权限 </span>
        </div>

        <div class="control-item">
          <label>Zone ID</label>
          <input
            type="text"
            v-model="zoneId"
            placeholder="输入你的 Zone ID"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint">在 Cloudflare 域名概览页面右侧可以找到 Zone ID</span>
        </div>

        <div class="divider"></div>

        <div class="control-item">
          <label>记录名称 (Name)</label>
          <input type="text" v-model="recordName" placeholder="例如: www 或 blog" class="x-input" />
          <span class="hint">子域名，留空则为根域名</span>
        </div>

        <div class="control-item">
          <label>目标地址 (Content)</label>
          <input
            type="text"
            v-model="recordContent"
            placeholder="例如: example.com"
            class="x-input" />
          <span class="hint">CNAME 指向的目标域名</span>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>启用 Cloudflare 代理</label>
            <label class="switch">
              <input type="checkbox" v-model="proxied" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <button @click="addCNAME" class="x-btn generate-btn" :disabled="loading">
          {{ loading ? '添加中...' : '添加 CNAME 记录' }}
        </button>
      </div>

      <div class="result-section" v-if="result">
        <h2>操作结果</h2>
        <div class="result-display" :class="{ success: result.success, error: !result.success }">
          <pre>{{ result.message }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import config from '@/config';

const apiToken = ref('');
const zoneId = ref('');
const recordName = ref('');
const recordContent = ref('');
const proxied = ref(false);
const loading = ref(false);
const result = ref<{ success: boolean; message: string } | null>(null);

const STORAGE_KEY = 'cloudflare_dns_config';

// 从 localStorage 加载配置
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      apiToken.value = config.apiToken || '';
      zoneId.value = config.zoneId || '';
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
});

// 保存到 localStorage
const saveToLocalStorage = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        apiToken: apiToken.value,
        zoneId: zoneId.value,
      })
    );
  } catch (e) {
    console.error('Failed to save config:', e);
  }
};

const addCNAME = async () => {
  // 验证输入
  if (!apiToken.value.trim()) {
    message.warning('请输入 API Token');
    return;
  }
  if (!zoneId.value.trim()) {
    message.warning('请输入 Zone ID');
    return;
  }
  if (!recordContent.value.trim()) {
    message.warning('请输入目标地址');
    return;
  }

  loading.value = true;
  result.value = null;

  try {
    const response = await axios.post(`https://api.tiouo.xyz/api/cloudflare/dns/cname`, {
      apiToken: apiToken.value.trim(),
      zoneId: zoneId.value.trim(),
      name: recordName.value.trim() || '@',
      content: recordContent.value.trim(),
      proxied: proxied.value,
    });

    if (response.data.success) {
      const data = response.data.data;
      result.value = {
        success: true,
        message: `✅ CNAME 记录添加成功！\n\n记录 ID: ${data.id}\n名称: ${data.name}\n内容: ${data.content}\n代理状态: ${data.proxied ? '已启用' : '仅 DNS'}`,
      };
      message.success('CNAME 记录添加成功');

      // 清空表单
      recordName.value = '';
      recordContent.value = '';
    } else {
      throw new Error(response.data.error || '未知错误');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message || '添加失败，请检查配置';

    result.value = {
      success: false,
      message: `❌ 添加失败\n\n${errorMsg}`,
    };
    message.error(errorMsg);
  } finally {
    loading.value = false;
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
  gap: 20px;
  margin-bottom: 32px;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.control-item {
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

.hint {
  font-size: 12px;
  color: var(--text-color-light, #94a3b8);
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

.divider {
  height: 1px;
  background: #e6e9ef;
  margin: 8px 0;
}

[data-theme='dark'] .divider {
  background: #334155;
}

.generate-btn {
  padding-left: 16px;
  font-size: 15px;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  border-radius: 12px;
  border: 1px solid #eef2f6;
  font-size: 14px;
  word-wrap: break-word;
  min-height: 50px;
}

.result-display pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  color: inherit;
}

.result-display.success {
  background: #f0fdf4;
  border-color: #86efac;
  color: #166534;
}

.result-display.error {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}

[data-theme='dark'] .result-display.success {
  background: #14532d;
  border-color: #22c55e;
  color: #bbf7d0;
}

[data-theme='dark'] .result-display.error {
  background: #450a0a;
  border-color: #ef4444;
  color: #fecaca;
}
</style>
