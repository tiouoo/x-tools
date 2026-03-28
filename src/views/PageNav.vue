<template>
  <div class="page-nav-container">
    <h1 class="title">Huh 何意味</h1>

    <div class="search-box">
      <a-input
        v-model:value="searchKeyword"
        placeholder="搜索页面（支持名称、路径）"
        size="large"
        allow-clear>
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>
    </div>

    <div class="nav-grid">
      <div
        v-for="item in filteredItems"
        :key="item.path"
        class="nav-card"
        @click="navigateTo(item.path)">
        <div class="nav-card-header">
          <div class="nav-card-title">{{ item.title }}</div>
          <div class="nav-card-path">{{ item.path }}</div>
        </div>
        <div v-if="item.description" class="nav-card-desc">{{ item.description }}</div>
      </div>
    </div>

    <div v-if="filteredItems.length === 0" class="empty-state">
      <a-empty description="未找到匹配的页面" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined } from '@ant-design/icons-vue';
import { pageItems } from './.nav.ts';
import { comparePinyin, matchSearch } from '@/utils/pinyin';

const router = useRouter();
const searchKeyword = ref('');

// 按拼音排序的导航项
const sortedItems = computed(() => {
  return [...pageItems].sort((a, b) => comparePinyin(a.title, b.title));
});

// 过滤后的导航项
const filteredItems = computed(() => {
  if (!searchKeyword.value.trim()) {
    return sortedItems.value;
  }

  const keyword = searchKeyword.value.trim();
  return sortedItems.value.filter((item) => {
    return matchSearch(item.title, keyword) || matchSearch(item.path, keyword);
  });
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
.page-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  margin-top: 20px;
  color: var(--text-color);
  font-size: 32px;
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
  border-radius: 9999px;
  color: var(--text-color);
  padding: 4px 16px;
}

.search-box :deep(.ant-input-affix-wrapper:focus),
.search-box :deep(.ant-input-affix-wrapper-focused),
.search-box :deep(.ant-input-affix-wrapper:hover) {
  border-color: #e5e7eb;
  box-shadow: none;
}

[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper:focus),
[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper-focused),
[data-theme='dark'] .search-box :deep(.ant-input-affix-wrapper:hover) {
  border-color: #334155;
  box-shadow: none;
}

.search-box :deep(.ant-input) {
  background-color: transparent;
  color: var(--text-color);
  font-family: 'ZhuZiAYuanJWD', sans-serif;
  font-size: 14px;
}

.search-box :deep(.ant-input::placeholder) {
  color: var(--text-color-light);
  font-family: 'ZhuZiAYuanJWD', sans-serif;
  font-size: 14px;
}

.search-box :deep(.anticon) {
  color: var(--text-color-light);
  margin-right: 6px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.nav-card {
  background-color: var(--card-bg);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-card:hover {
  background-color: var(--card-bg-hover);
}

.nav-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.nav-card-title {
  font-size: 16px;
  font-weight: normal;
  color: var(--text-color);
}

.nav-card-path {
  font-size: 12px;
  color: var(--text-color-light);
  font-family: 'ZhuZiAYuanJWD', sans-serif;
  margin-left: 12px;
  flex-shrink: 0;
}

.nav-card-desc {
  font-size: 12px;
  color: var(--text-color-light);
  line-height: 1.5;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state :deep(.ant-empty-description) {
  color: var(--text-color-light);
}
</style>
