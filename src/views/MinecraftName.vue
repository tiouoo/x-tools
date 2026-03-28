<template>
  <div class="wrap">
    <div class="card">
      <h1>网易我的世界随机名生成器</h1>
      <p class="lead">生成"我的世界中国版风格"的随机名字</p>

      <div class="result-box">
        <div class="name-display">{{ displayName }}</div>
      </div>

      <div class="controls-row">
        <div class="control-group">
          <label>名字上限</label>
          <input v-model.number="maxLength" type="number" min="1" max="20" class="length-input" />
        </div>
        <button @click="generateName" class="gen-btn">生成随机名</button>
        <button @click="copyName" :disabled="!currentName" class="copy-btn">复制</button>
      </div>

      <div class="history-section">
        <h3>最近生成（最多 20 条）</h3>
        <div class="history-list">
          <div
            v-for="(name, index) in history"
            :key="index"
            class="history-item"
            @click="selectFromHistory(name)">
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const currentName = ref('');
const maxLength = ref(16);
const history = ref<string[]>([]);

const displayName = computed(() => currentName.value || '点击生成随机名');

// 词库数据
const adjectives = [
  '金天真',
  '凶猛',
  '铁低调',
  '倔强',
  '铁迅捷',
  '金凶猛',
  '怂萌',
  '铁沉稳',
  '金自信',
  '聪明',
  '金神秘',
  '金机智',
  '末地',
  '暗影',
  '金倔强',
  '孤勇',
  '潮涌',
  '铁机智',
  '坚韧',
  '金聪明',
  '大胆',
  '阴险',
  '金迟钝',
  '铁狂笑',
  '铁怂萌',
  '铁勇敢',
  '极限',
  '传说',
  '银白',
  '金温柔',
  '铁冲动',
  '金灵巧',
  '金自律',
];

const nouns = [
  '狼',
  '蛇',
  '龙',
  '猪',
  '鸡',
  '狐狸',
  '蜜蜂',
  '村民',
  '骷髅',
  '僵尸',
  '末影人',
  '凋灵',
  '守卫者',
  '幻影',
  '唤魔者',
  '卫道士',
  '掠夺者',
  '雪傀儡',
  '铁傀儡',
  '诗人',
  '学者',
  '船长',
  '忍者',
  '骑士',
  '球迷',
];

const verbPhrases = [
  '探险',
  '挖矿',
  '建造',
  '战斗',
  '种田',
  '钓鱼',
  '酿药',
  '附魔',
  '驯服',
  '探索',
  '冒险',
  '守护',
  '巡逻',
  '飞行',
  '潜行',
  '奔跑',
  '跳跃',
  '游泳',
  '攀爬',
  '合成',
];

const places = [
  '山谷',
  '海岸',
  '丛林',
  '沙漠',
  '雪原',
  '冰原',
  '竹林',
  '村庄',
  '要塞',
  '地牢',
  '矿洞',
  '峡谷',
  '遗迹',
  '神殿',
  '城堡',
  '塔楼',
  '洞穴',
  '裂隙',
  '高台',
  '密室',
];

// 随机选择函数
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 生成名字的规则
const generateNameByRule = (): string => {
  const rules = [
    // 形容词 + 的 + 名词 + 动词短语
    () => `${randomChoice(adjectives)}的${randomChoice(nouns)}${randomChoice(verbPhrases)}`,
    // 形容词 + 的 + 名词
    () => `${randomChoice(adjectives)}的${randomChoice(nouns)}`,
    // 名词 + 地点
    () => `${randomChoice(nouns)}${randomChoice(places)}`,
  ];

  return randomChoice(rules)();
};

// 生成名字
const generateName = () => {
  let name = '';
  let attempts = 0;
  const maxAttempts = 100;

  // 尝试生成符合长度限制的名字
  while (attempts < maxAttempts) {
    name = generateNameByRule();
    if (name.length <= maxLength.value) {
      break;
    }
    attempts++;
  }

  // 如果还是太长，使用最简单的规则
  if (name.length > maxLength.value) {
    const shortAdj = adjectives.filter((a) => a.length <= 3);
    const shortNoun = nouns.filter((n) => n.length <= 2);
    if (shortAdj.length > 0 && shortNoun.length > 0) {
      name = `${randomChoice(shortAdj)}的${randomChoice(shortNoun)}`;
    }
  }

  currentName.value = name;

  // 添加到历史记录
  history.value.unshift(name);
  if (history.value.length > 20) {
    history.value.pop();
  }
};

// 复制名字
const copyName = async () => {
  if (!currentName.value) return;

  try {
    await navigator.clipboard.writeText(currentName.value);
    alert('已复制到剪贴板');
  } catch {
    const input = document.createElement('input');
    input.value = currentName.value;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('已复制到剪贴板');
  }
};

// 从历史记录选择
const selectFromHistory = (name: string) => {
  currentName.value = name;
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

.result-box {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  padding: 32px 20px;
  margin-bottom: 24px;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme='dark'] .result-box {
  background: #1e293b;
  border-color: #334155;
}

.name-display {
  font-size: 28px;
  color: var(--text-color, #0f172a);
  text-align: center;
  word-break: break-all;
}

.controls-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-size: 14px;
  color: var(--text-color, #0f172a);
  white-space: nowrap;
}

.length-input {
  width: 70px;
  padding: 6px 12px;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  font-size: 14px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  outline: none;
  transition: border-color 0.2s;
  height: 32px;
}

.length-input:focus {
  border-color: #667eea;
}

[data-theme='dark'] .length-input {
  border-color: #334155;
}

[data-theme='dark'] .length-input:focus {
  border-color: #764ba2;
}

button {
  background: #667eea;
  color: #fff;
  border: 0;
  padding: 6px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: all 0.2s;
  height: 32px;
}

button:hover:not(:disabled) {
  background: #5568d3;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gen-btn {
  flex: 1;
  min-width: 120px;
}

.copy-btn {
  background: #10b981;
}

.copy-btn:hover:not(:disabled) {
  background: #059669;
}

.history-section {
  margin-top: 28px;
}

.history-section h3 {
  font-size: 16px;
  color: var(--text-color, #0f172a);
  margin: 0 0 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 300px;
  overflow-y: auto;
  padding: 4px;
  margin: 0 -8px;
  padding: 4px 8px 4px 12px;
}

.history-item {
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-color, #0f172a);
}

.history-item:hover {
  background: #eef2ff;
  border-color: #667eea;
}

[data-theme='dark'] .history-item {
  background: #1e293b;
  border-color: #334155;
  color: var(--text-color);
}

[data-theme='dark'] .history-item:hover {
  background: #334155;
  border-color: #764ba2;
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
</style>
