<template>
  <div class="page-nav-container">
    <h1 class="title">Whois 查询</h1>

    <div class="search-box">
      <a-input v-model:value="domain" placeholder="输入域名..." size="large" @pressEnter="handleWhoisQuery">
        <template #prefix>
          <GlobalOutlined class="icon" />
        </template>
        <template #suffix>
          <SearchOutlined class="icon" @click="handleWhoisQuery" />
        </template>
      </a-input>
    </div>

    <div v-if="loading" class="loading-state">
      <a-spin tip="查询中..." />
    </div>

    <div v-else-if="error" class="error-state">
      <a-alert message="查询失败" :description="errorMessage || '请检查域名格式是否正确，或稍后重试'" type="error" show-icon />
    </div>

    <div v-else-if="result" class="result-container">

      <div class="card" style="padding-bottom: 25px;">
        <div class="result-header">
          <h2 class="result-title">{{ result.data.domain }}</h2>
          <span class="availability-badge" :class="result.data.is_available ? 'available' : 'registered'">
            {{ result.data.is_available ? '可注册' : '已注册' }}
          </span>
        </div>

        <div class="info-card domain-info">
          <div class="info-card-header">
            <GlobalOutlined class="card-icon" />
            <h3>域名信息</h3>
          </div>
          <div class="info-card-content">
            <div class="info-item">
              <span class="info-label">注册商：</span>
              <span class="info-value">{{ result.data.info.registrar_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册日期：</span>
              <span class="info-value">{{ result.data.info.creation_time }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">到期日期：</span>
              <span class="info-value expiration">{{ result.data.info.expiration_time }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册天数：</span>
              <span class="info-value">{{ result.data.info.creation_days }} 天</span>
            </div>
            <div class="info-item">
              <span class="info-label">距离到期：</span>
              <span class="info-value">{{ result.data.info.valid_days }} 天</span>
            </div>
          </div>
        </div>

        <div class="info-card registrant-info">
          <div class="info-card-header">
            <UserOutlined class="card-icon" />
            <h3>注册人信息</h3>
          </div>
          <div class="info-card-content">
            <div class="info-item">
              <span class="info-label">注册人：</span>
              <span class="info-value">{{ result.data.info.registrant_name || '已开启隐私保护' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册邮箱：</span>
              <span class="info-value">{{ result.data.info.registrant_email || '已开启隐私保护' }}</span>
            </div>
          </div>
        </div>
        <div v-if="result.data.info.domain_status.length > 0" class="info-card domain-status">
          <div class="info-card-header">
            <AlertOutlined class="card-icon" />
            <h3>域名状态</h3>
          </div>
          <div class="info-card-content">
            <div v-for="(status, index) in result.data.info.domain_status" :key="index" class="status-item">
              <span class="status-text">{{ status }}</span>
              <CopyOutlined @click="copy(status)" class="copy-icon" />
            </div>
          </div>
        </div>
        <div v-if="result.data.info.name_server.length > 0" class="info-card dns-servers">
          <div class="info-card-header">
            <WifiOutlined class="card-icon" />
            <h3>DNS服务器</h3>
          </div>
          <div class="info-card-content">
            <div v-for="(ns, index) in result.data.info.name_server" :key="index" class="ns-item">
              <span class="ns-text">{{ ns }}</span>
              <CopyOutlined @click="copy(ns)" class="copy-icon" />
            </div>
          </div>
        </div>
        <div v-if="result.data.info.whois_server.length > 0" class="info-card other-info">
          <div class="info-card-header">
            <InfoCircleOutlined class="card-icon" />
            <h3>其它信息</h3>
          </div>
          <div class="info-card-content">
            <div class="info-item">
              <span class="info-label">Whois服务器：</span>
              <span class="info-value">{{ result.data.info.whois_server }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="raw-data-card">
        <div class="raw-header">
          <h3>全部字段信息</h3>
        </div>
        <div class="fields-table">
          <div class="fields-table-body">
            <div v-for="(value, key) in result.data.fields" :key="key" class="fields-table-row">
              <div class="fields-table-cell">{{ key }}</div>
              <div class="fields-table-cell">{{ typeof value === 'object' ? JSON.stringify(value) : value || '<data notdisclosed>' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="raw-data-card">
        <div class="raw-header">
          <h3>原始数据</h3>
        </div>
        <div class="raw-content">
          <pre>{{ result.data.raw }}</pre>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <a-empty description="输入域名并点击查询按钮开始Whois查询" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchOutlined, GlobalOutlined, UserOutlined, InfoCircleOutlined, AlertOutlined, WifiOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getWhoisInfo } from '../../utils/whois';
import type { WhoisResponse } from '../../types/whois';

const copy = (str: string) => {
  navigator.clipboard.writeText(str);
  message.success('复制成功');
}

const domain = ref('');
const loading = ref(false);
const error = ref(false);
const errorMessage = ref('');
const result = ref<WhoisResponse | null>(null);

async function handleWhoisQuery() {
  const domainValue = domain.value.trim();

  if (!domainValue) {
    message.warning('请输入域名');
    return;
  }

  loading.value = true;
  error.value = false;
  errorMessage.value = '';
  result.value = null;

  try {
    const data = await getWhoisInfo(domainValue);
    console.log('data:', data);
    result.value = data;
  } catch (err) {
    console.error('查询失败:', err);
    error.value = true;
    errorMessage.value = err instanceof Error ? err.message : '查询失败，请稍后重试';
    message.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.page-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 30px;
  color: var(--text-color);
  font-size: 36px;
}

.search-box {
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.search-box :deep(.ant-input-affix-wrapper) {
  background-color: var(--card-bg);
  border: var(--card-border);
  border-radius: 16px;
  color: var(--text-color);
  padding: 12px 16px;
}

.search-box :deep(.ant-input-affix-wrapper:focus),
.search-box :deep(.ant-input-affix-wrapper-focused),
.search-box :deep(.ant-input-affix-wrapper:hover) {
  border-color: #667eea;
  box-shadow: none;
}

[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper:focus),
[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper-focused),
[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper:hover) {
  border-color: #667eea;
  box-shadow: none;
}

.search-box :deep(.ant-input) {
  background-color: transparent !important;
  color: var(--text-color);
  font-family: 'ZhuZiAYuanJWD', sans-serif;
  font-size: 16px !important;
}

.search-box :deep(.ant-input::placeholder) {
  color: var(--text-color-light);
  font-family: 'ZhuZiAYuanJWD', sans-serif;
  font-size: 16px;
}

.search-box :deep(.anticon) {
  color: var(--text-color-light);
  margin-right: 6px;
}

.search-btn {
  margin: 0 4px;
  border-radius: 8px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state {
  max-width: 700px;
  margin: 0 auto 30px;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--card-border);
}

.result-title {
  font-size: 24px;
  margin-left: 5px !important;
  color: var(--text-color);
  margin: 0;
}

.availability-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 2px;
}

.availability-badge.available {
  background-color: #d1fae5;
  color: #065f46;
}

.availability-badge.registered {
  background-color: #fce7f3;
  color: #9d174d;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  background-color: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 5px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

h3 {
  font-weight: 400 !important;
  color: var(--text-color);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  margin-top: 14px;
}

.card-icon {
  font-size: 18px;
  font-weight: bold;
}

.domain-info .card-icon {
  color: #3b82f6;
}

.registrant-info .card-icon {
  color: #8b5cf6;
}

.other-info .card-icon {
  color: #10b981;
}

.domain-status .card-icon {
  color: #f59e0b;
}

.dns-servers .card-icon {
  color: #6366f1;
}

.all-fields-info .card-icon {
  color: #6366f1;
}

.info-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
}

.fields-table-header {
  display: flex;
  color: var(--text-color-light);
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.fields-table-header-cell {
  flex: 1;
  padding: 8px 12px;
}


.fields-table-row {
  display: flex;
  transition: background-color 0.2s ease;
  padding: 4px 0;
}

.fields-table-row:not(:nth-last-child(1)){
    border-bottom: var(--card-border) !important;

}

.fields-table-row:hover {
  background-color: var(--card-bg-hover);
}

.fields-table-cell {
  flex: 1;
  padding: 10px 12px;
  color: var(--text-color);
}

.fields-table-cell:first-child {
  font-weight: 500;
  color: var(--text-color-light);
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-left: 12px;
}

.all-fields-info .info-card-content {
  margin-left: 0;
  padding: 0 12px;
}

.fields-table {
  width: 100%;
  border-collapse: collapse;
}

.fields-table-header {
  display: flex;
  font-weight: 600;
  color: var(--text-color-light);
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.fields-table-header-cell {
  flex: 1;
  padding: 8px 12px;
}

.fields-table-body {
  overflow-y: auto;
}

.fields-table-row {
  display: flex;
  border-bottom: 1px solid var(--card-border);
  transition: background-color 0.2s ease;
}

.fields-table-row:hover {
  background-color: var(--card-bg-hover);
}

.fields-table-cell {
  flex: 1;
  padding: 10px 12px;
  color: var(--text-color);
  word-break: break-all;
}

.fields-table-cell:first-child {
  font-weight: 500;
  color: var(--text-color-light);
  flex: 0 0 300px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: var(--text-color-light);
  flex-shrink: 0;
}

.info-value {
  color: var(--text-color);
  flex: 1;
  text-align: right;
}

.info-value.expiration {
  color: #ef4444;
  font-weight: 500;
}

.status-item,
.ns-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--card-bg-hover);
  border-radius: 8px;
}

.status-text,
.ns-text {
  color: var(--text-color);
  flex: 1;
  font-size: 14px;
}

.copy-icon {
  font-size: 14px;
  color: var(--text-color-light);
  cursor: pointer;
  transition: color 0.2s ease;
}

.copy-icon:hover {
  color: #667eea;
}

.raw-data-card {
  background-color: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 20px;
}

.raw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.raw-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.raw-content {
  background-color: var(--card-bg-hover);
  border-radius: 8px;
  padding: 16px;
  /* max-height: 300px; */
  overflow-y: auto;
}

.raw-content pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state :deep(.ant-empty-description) {
  color: var(--text-color-light);
  font-size: 16px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-value {
    text-align: left;
    width: 100%;
  }

  .status-item,
  .ns-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .copy-icon {
    align-self: flex-end;
    margin-top: -20px;
  }
}
</style>
