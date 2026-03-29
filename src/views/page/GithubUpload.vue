<template>
  <div class="wrap">
    <div class="card">
      <h1>GitHub 文件上传</h1>
      <p class="lead">拖拽文件上传到 GitHub 仓库，支持自定义文件名模板</p>

      <div class="controls">
        <div class="control-item">
          <label>GitHub Token</label>
          <input
            type="password"
            v-model="githubToken"
            placeholder="输入你的 GitHub Personal Access Token"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint"
            >需要 repo 权限，在 GitHub Settings > Developer settings > Personal access tokens
            创建</span
          >
        </div>

        <div class="control-item">
          <label>仓库名称</label>
          <input
            type="text"
            v-model="repoName"
            placeholder="例如: username/repository"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint">格式: 用户名/仓库名</span>
        </div>

        <div class="control-item">
          <label>分支名称</label>
          <input
            type="text"
            v-model="branch"
            placeholder="默认: main"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint">留空则使用 main 分支</span>
        </div>

        <div class="divider"></div>

        <div class="control-item">
          <label>文件路径模板</label>
          <input
            type="text"
            v-model="pathTemplate"
            placeholder="例如: uploads/{year}/{month}/{filename}"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint"
            >支持占位符: {year} {month} {day} {hour} {minute} {second} {timestamp} {filename} {name}
            {ext}</span
          >
        </div>

        <div class="placeholder-help">
          <div class="placeholder-item"><code>{year}</code> - 年份 (2024)</div>
          <div class="placeholder-item"><code>{month}</code> - 月份 (01-12)</div>
          <div class="placeholder-item"><code>{day}</code> - 日期 (01-31)</div>
          <div class="placeholder-item"><code>{hour}</code> - 小时 (00-23)</div>
          <div class="placeholder-item"><code>{minute}</code> - 分钟 (00-59)</div>
          <div class="placeholder-item"><code>{second}</code> - 秒 (00-59)</div>
          <div class="placeholder-item"><code>{timestamp}</code> - 时间戳</div>
          <div class="placeholder-item"><code>{filename}</code> - 完整文件名</div>
          <div class="placeholder-item"><code>{name}</code> - 文件名(无扩展名)</div>
          <div class="placeholder-item"><code>{ext}</code> - 扩展名</div>
        </div>

        <div class="control-item">
          <label>Commit 消息</label>
          <input
            type="text"
            v-model="commitMessage"
            placeholder="例如: Upload {filename}"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint">支持相同的占位符</span>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>自动生成 CDN 链接</label>
            <label class="switch">
              <input type="checkbox" v-model="generateCdnLink" @change="saveToLocalStorage" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="control-item">
          <label>自定义 CDN 地址模板（可选）</label>
          <input
            type="text"
            v-model="customCdnTemplate"
            placeholder="例如: https://cdn.example.com/{repo}/{branch}/{path}"
            class="x-input"
            @input="saveToLocalStorage" />
          <span class="hint">支持占位符: {repo} {branch} {path} {filename} {name} {ext}</span>
        </div>

        <div class="placeholder-help">
          <div class="placeholder-item"><code>{repo}</code> - 仓库名</div>
          <div class="placeholder-item"><code>{branch}</code> - 分支名</div>
          <div class="placeholder-item"><code>{path}</code> - 文件完整路径</div>
          <div class="placeholder-item"><code>{filename}</code> - 完整文件名</div>
          <div class="placeholder-item"><code>{name}</code> - 文件名(无扩展名)</div>
          <div class="placeholder-item"><code>{ext}</code> - 扩展名</div>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>文件名转小写</label>
            <label class="switch">
              <input type="checkbox" v-model="lowercaseFilename" @change="saveToLocalStorage" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="control-row">
          <div class="control-item switch-item">
            <label>替换空格为连字符</label>
            <label class="switch">
              <input type="checkbox" v-model="replaceSpaces" @change="saveToLocalStorage" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="divider"></div>

        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput">
          <input
            type="file"
            ref="fileInputRef"
            @change="handleFileSelect"
            multiple
            style="display: none" />
          <div class="upload-icon">📁</div>
          <div class="upload-text">拖拽文件到这里或点击选择</div>
          <div class="upload-hint">支持多文件上传</div>
        </div>

        <div v-if="selectedFiles.length > 0" class="file-list">
          <div class="file-item" v-for="(file, index) in selectedFiles" :key="index">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button @click="removeFile(index)" class="x-e-btn remove-btn">✕</button>
          </div>
        </div>

        <button
          @click="uploadFiles"
          class="x-btn generate-btn"
          :disabled="loading || selectedFiles.length === 0">
          {{ loading ? '上传中...' : `上传 ${selectedFiles.length} 个文件` }}
        </button>
      </div>

      <div class="result-section" v-if="uploadResults.length > 0">
        <h2>上传结果</h2>
        <div
          class="result-item"
          v-for="(result, index) in uploadResults"
          :key="index"
          :class="{ success: result.success, error: !result.success }">
          <div class="result-header">
            <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
            <span class="result-filename">{{ result.filename }}</span>
          </div>
          <div class="result-content">
            <div v-if="result.success">
              <div class="result-link">
                <strong>GitHub:</strong>
                <a :href="result.url" target="_blank">{{ result.url }}</a>
              </div>
              <div v-if="result.cdnUrl" class="result-link">
                <strong>CDN:</strong>
                <a :href="result.cdnUrl" target="_blank">{{ result.cdnUrl }}</a>
              </div>
              <div v-if="result.customCdnUrl" class="result-link">
                <strong>自定义 CDN:</strong>
                <a :href="result.customCdnUrl" target="_blank">{{ result.customCdnUrl }}</a>
              </div>
            </div>
            <div v-else class="error-message">{{ result.error }}</div>
          </div>
        </div>
        <button @click="clearResults" class="x-e-btn clear-btn">清空结果</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import config from '@/config';

const githubToken = ref('');
const repoName = ref('');
const branch = ref('main');
const pathTemplate = ref('uploads/{year}/{month}/{day}/{filename}');
const commitMessage = ref('Upload {filename}');
const generateCdnLink = ref(true);
const customCdnTemplate = ref('');
const lowercaseFilename = ref(false);
const replaceSpaces = ref(true);
const loading = ref(false);
const isDragOver = ref(false);
const selectedFiles = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

interface UploadResult {
  filename: string;
  success: boolean;
  url?: string;
  cdnUrl?: string;
  customCdnUrl?: string;
  error?: string;
}

const uploadResults = ref<UploadResult[]>([]);

const STORAGE_KEY = 'github_upload_config';

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedConfig = JSON.parse(saved);
      githubToken.value = savedConfig.githubToken || '';
      repoName.value = savedConfig.repoName || '';
      branch.value = savedConfig.branch || 'main';
      customCdnTemplate.value = savedConfig.customCdnTemplate || '';
      pathTemplate.value = savedConfig.pathTemplate || 'uploads/{year}/{month}/{day}/{filename}';
      commitMessage.value = savedConfig.commitMessage || 'Upload {filename}';
      generateCdnLink.value =
        savedConfig.generateCdnLink !== undefined ? savedConfig.generateCdnLink : true;
      lowercaseFilename.value = savedConfig.lowercaseFilename || false;
      replaceSpaces.value =
        savedConfig.replaceSpaces !== undefined ? savedConfig.replaceSpaces : true;
    }
  } catch (e) {
    console.error('Failed to load config:', e);
  }
});

const saveToLocalStorage = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        githubToken: githubToken.value,
        repoName: repoName.value,
        branch: branch.value,
        customCdnTemplate: customCdnTemplate.value,
        pathTemplate: pathTemplate.value,
        commitMessage: commitMessage.value,
        generateCdnLink: generateCdnLink.value,
        lowercaseFilename: lowercaseFilename.value,
        replaceSpaces: replaceSpaces.value,
      })
    );
  } catch (e) {
    console.error('Failed to save config:', e);
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;

  const files = Array.from(e.dataTransfer?.files || []);
  selectedFiles.value.push(...files);
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  selectedFiles.value.push(...files);
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const processFilename = (filename: string): string => {
  let processed = filename;

  if (replaceSpaces.value) {
    processed = processed.replace(/\s+/g, '-');
  }

  if (lowercaseFilename.value) {
    processed = processed.toLowerCase();
  }

  return processed;
};

const generateCustomCdnUrl = (filePath: string, filename: string): string => {
  if (!customCdnTemplate.value.trim()) {
    return '';
  }

  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.') + 1) : '';

  let url = customCdnTemplate.value;
  url = url.replace(/{repo}/g, repoName.value.trim());
  url = url.replace(/{branch}/g, branch.value.trim() || 'main');
  url = url.replace(/{path}/g, filePath);
  url = url.replace(/{filename}/g, filename);
  url = url.replace(/{name}/g, nameWithoutExt);
  url = url.replace(/{ext}/g, ext);

  return url;
};

const uploadFiles = async () => {
  if (!githubToken.value.trim()) {
    message.warning('请输入 GitHub Token');
    return;
  }
  if (!repoName.value.trim()) {
    message.warning('请输入仓库名称');
    return;
  }
  if (selectedFiles.value.length === 0) {
    message.warning('请选择要上传的文件');
    return;
  }

  loading.value = true;
  uploadResults.value = [];

  for (const file of selectedFiles.value) {
    try {
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Content = fileContent.split(',')[1];
      const processedFilename = processFilename(file.name);

      // 计算文件路径用于自定义 CDN
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      const timestamp = now.getTime();
      const nameWithoutExt =
        processedFilename.substring(0, processedFilename.lastIndexOf('.')) || processedFilename;
      const ext = processedFilename.includes('.')
        ? processedFilename.substring(processedFilename.lastIndexOf('.') + 1)
        : '';

      let filePath = pathTemplate.value.trim();
      filePath = filePath.replace(/{year}/g, String(year));
      filePath = filePath.replace(/{month}/g, month);
      filePath = filePath.replace(/{day}/g, day);
      filePath = filePath.replace(/{hour}/g, hour);
      filePath = filePath.replace(/{minute}/g, minute);
      filePath = filePath.replace(/{second}/g, second);
      filePath = filePath.replace(/{timestamp}/g, String(timestamp));
      filePath = filePath.replace(/{filename}/g, processedFilename);
      filePath = filePath.replace(/{name}/g, nameWithoutExt);
      filePath = filePath.replace(/{ext}/g, ext);

      const response = await axios.post(`${config.api}/api/github/upload`, {
        token: githubToken.value.trim(),
        repo: repoName.value.trim(),
        branch: branch.value.trim() || 'main',
        pathTemplate: pathTemplate.value.trim(),
        commitMessage: commitMessage.value.trim(),
        filename: processedFilename,
        content: base64Content,
        generateCdnLink: generateCdnLink.value,
      });

      if (response.data.success) {
        const customCdn = generateCustomCdnUrl(
          response.data.data.path || filePath,
          processedFilename
        );

        uploadResults.value.push({
          filename: file.name,
          success: true,
          url: response.data.data.url,
          cdnUrl: response.data.data.cdnUrl,
          customCdnUrl: customCdn || undefined,
        });
      } else {
        throw new Error(response.data.error || '上传失败');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || '上传失败';
      uploadResults.value.push({
        filename: file.name,
        success: false,
        error: errorMsg,
      });
    }
  }

  loading.value = false;

  const successCount = uploadResults.value.filter((r) => r.success).length;
  const failCount = uploadResults.value.length - successCount;

  if (failCount === 0) {
    message.success(`全部上传成功！共 ${successCount} 个文件`);
    selectedFiles.value = [];
  } else {
    message.warning(`上传完成：${successCount} 成功，${failCount} 失败`);
  }
};

const clearResults = () => {
  uploadResults.value = [];
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

.placeholder-help {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f6;
}

[data-theme='dark'] .placeholder-help {
  background: #1e293b;
  border-color: #334155;
}

.placeholder-item {
  font-size: 12px;
  color: var(--text-color-light, #6b7280);
}

.placeholder-item code {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

[data-theme='dark'] .placeholder-item code {
  background: #312e81;
  color: #c7d2fe;
}

.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f1f5f9;
}

.upload-zone.drag-over {
  border-color: #667eea;
  background: #e0e7ff;
}

[data-theme='dark'] .upload-zone {
  background: #1e293b;
  border-color: #475569;
}

[data-theme='dark'] .upload-zone:hover {
  border-color: #764ba2;
  background: #334155;
}

[data-theme='dark'] .upload-zone.drag-over {
  border-color: #764ba2;
  background: #312e81;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: var(--text-color, #0f172a);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-color-light, #94a3b8);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f6;
}

[data-theme='dark'] .file-item {
  background: #1e293b;
  border-color: #334155;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: var(--text-color, #0f172a);
}

.file-size {
  font-size: 12px;
  color: var(--text-color-light, #94a3b8);
}

.remove-btn {
  padding: 4px 8px;
  font-size: 12px;
  min-width: auto;
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

.result-item {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eef2f6;
  margin-bottom: 12px;
}

.result-item.success {
  background: #f0fdf4;
  border-color: #86efac;
}

.result-item.error {
  background: #fef2f2;
  border-color: #fca5a5;
}

[data-theme='dark'] .result-item.success {
  background: #14532d;
  border-color: #22c55e;
}

[data-theme='dark'] .result-item.error {
  background: #450a0a;
  border-color: #ef4444;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-icon {
  font-size: 16px;
}

.result-filename {
  font-size: 14px;
  color: var(--text-color, #0f172a);
}

.result-content {
  font-size: 13px;
  margin-top: 10px;
  margin-bottom: -5px;
}
strong {
  color: var(--text-color);
  font-weight: 100;
}
.result-link {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  word-break: break-all;
}

.result-link a {
  color: #667eea;
  text-decoration: none;
}

.result-link a:hover {
  text-decoration: underline;
}

[data-theme='dark'] .result-link a {
  color: #a78bfa;
}

.error-message {
  color: #991b1b;
}

[data-theme='dark'] .error-message {
  color: #fecaca;
}

.clear-btn {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 14px;
}
</style>
