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
          <input v-model.number="maxLength" type="number" min="1" max="100" class="length-input" />
        </div>
        <button @click="generateName" class="gen-btn">生成随机名</button>
        <button @click="copyName" :disabled="!currentName" class="copy-btn">复制</button>
      </div>

      <div class="history-section">
        <h3>最近生成（最多 100 条）</h3>
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
// 形容词 / 前缀词（我的世界风格 + 霸气/可爱/神秘）
const adjectives = [
  // 原版保留
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

  // 大量拓展（我的世界氛围）
  '烈焰',
  '寒冰',
  '雷霆',
  '风暴',
  '虚空',
  '混沌',
  '破晓',
  '暮色',
  '星辉',
  '月光',
  '烈日',
  '黑曜石',
  '钻石',
  '翡翠',
  '紫晶',
  '红石',
  '青金石',
  '下界',
  '魂火',
  '幽影',
  '寂静',
  '狂怒',
  '无畏',
  '迅捷',
  '沉稳',
  '灵动',
  '狡黠',
  '忠诚',
  '狂暴',
  '优雅',
  '冷酷',
  '炽热',
  '冰冷',
  '闪耀',
  '璀璨',
  '幽暗',
  '深邃',
  '苍茫',
  '辽阔',
  '荒芜',
  '富饶',
  '神秘',
  '古老',
  '永恒',
  '短暂',
  '瞬间',
  '辉煌',
  '黯淡',
  '华丽',
  '朴素',
  '威武',
  '霸气',
  '呆萌',
  '傲娇',
  '高冷',
  '温柔',
  '热血',
  '冷静',
  '疯狂',
  '理智',
  '勇敢',
  '怯懦',
  '坚强',
  '脆弱',
  '光明',
  '黑暗',
  '正义',
  '邪恶',
  '纯净',
  '污浊',
  '神圣',
  '邪恶',
  '金辉',
  '银辉',
  '铜铁',
  '钢骨',
  '风驰',
  '电掣',
  '星驰',
  '月影',
  '日光',
  '极光',
  '流星',
  '星云',
  '银河',
  '苍穹',
  '天地',
  '山海',
  '熔岩',
  '流水',
  '风沙',
  '岩石',
  '草木',
  '花叶',
  '果实',
  '种子',
  '铁骨',
  '冰心',
  '烈火',
  '柔水',
  '疾风',
  '劲草',
  '青松',
  '翠竹',
  '黑耀',
  '紫焰',
  '青冥',
  '碧落',
  '黄泉',
  '红尘',
  '紫电',
  '青霜',
  '赤焰',
  '蓝冰',
  '绿风',
  '黄砂',
  '白云',
  '黑雾',
  '金芒',
  '银光',
  '霸气',
  '威武',
  '雄壮',
  '娇小',
  '玲珑',
  '剔透',
  '坚硬',
  '柔软',
  '尖锐',
  '圆润',
  '锋利',
  '迟钝',
  '明亮',
  '昏暗',
  '清晰',
  '模糊',
  '真实',
  '虚幻',
  '存在',
  '消逝',
  '新生',
  '毁灭',
  '创造',
  '守护',
  '破坏',
  '治愈',
  '伤害',
  '祝福',
  '诅咒',
  '幸运',
  '厄运',
  '希望',
  '绝望',
  '光明',
  '黑暗',
  '温暖',
  '寒冷',
  '舒适',
  '痛苦',
  '快乐',
  '悲伤',
  '愤怒',
  '平静',
  '激动',
  '兴奋',
  '失落',
  '满足',
  '空虚',
  '充实',
  '自由',
  '束缚',
  '飞翔',
  '坠落',
  '上升',
  '下沉',
  '前进',
  '后退',
  '静止',
  '流动',
  '旋转',
  '跳跃',
  '奔跑',
  '行走',
  '爬行',
  '飞翔',
  '游泳',
  '潜水',
  '漂浮',
  '沉没',
  '燃烧',
  '熄灭',
  '冻结',
  '融化',
  '蒸发',
  '凝结',
  '破碎',
  '完整',
  '分裂',
  '合并',
  '打开',
  '关闭',
  '启动',
  '停止',
  '开始',
  '结束',
  '起源',
  '终结',
  '无限',
  '有限',
  '巨大',
  '渺小',
  '宽广',
  '狭窄',
  '高大',
  '矮小',
  '长长',
  '短短',
  '粗粗',
  '细细',
  '圆圆',
  '扁扁',
  '方方',
  '尖尖',
  '钝钝',
  '轻轻',
  '重重',
  '快快',
  '慢慢',
  '早早',
  '晚晚',
  '深深',
  '浅浅',
  '高高',
  '低低',
  '上上下下',
  '左左右右',
  '前前后后',
  '里里外外',
];

// 名词 / 生物 / 角色（我的世界原版生物 + 幻想职业）
const nouns = [
  // 原版保留
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

  // 大量拓展
  '末影龙',
  '烈焰人',
  '恶魂',
  '史莱姆',
  '岩浆怪',
  '蠹虫',
  '银鱼',
  '蜘蛛',
  '洞穴蜘蛛',
  '女巫',
  '流浪商人',
  '铁傀儡',
  '雪傀儡',
  '海豚',
  '海龟',
  '豹猫',
  '猫',
  '羊',
  '牛',
  '蘑菇牛',
  '马',
  '驴',
  '骡',
  '羊驼',
  '兔子',
  '蝙蝠',
  '鱿鱼',
  '发光鱿鱼',
  '美西螈',
  '青蛙',
  '蝌蚪',
  '监守者',
  '悦灵',
  '嗅探兽',
  '流浪者',
  '尸壳',
  '鸡骑士',
  '蜘蛛骑士',
  '小僵尸',
  '小村民',
  '法师',
  '术士',
  '巫师',
  '魔导师',
  '战士',
  '刺客',
  '游侠',
  '猎人',
  '射手',
  '弓手',
  '剑士',
  '盾卫',
  '牧师',
  '祭司',
  '召唤师',
  '咒术师',
  '炼金师',
  '工匠',
  '铁匠',
  '矿工',
  '农夫',
  '渔夫',
  '厨师',
  '裁缝',
  '木匠',
  '石匠',
  '建筑师',
  '探险家',
  '冒险家',
  '旅行者',
  '流浪者',
  '朝圣者',
  '预言家',
  '占星师',
  '星术师',
  '月神',
  '太阳神',
  '战神',
  '死神',
  '精灵',
  '矮人',
  '兽人',
  '巨人',
  '地精',
  '巨魔',
  '石像鬼',
  '天使',
  '恶魔',
  '幽灵',
  '亡魂',
  '怨灵',
  '妖灵',
  '精怪',
  '妖兽',
  '神兽',
  '圣兽',
  '灵宠',
  '战宠',
  '坐骑',
  '伙伴',
  '队友',
  '首领',
  '王者',
  '帝王',
  '君主',
  '女皇',
  '公主',
  '王子',
  '公爵',
  '侯爵',
  '伯爵',
  '子爵',
  '男爵',
  '骑士长',
  '将军',
  '元帅',
  '统帅',
  '先锋',
  '斥候',
  '密探',
  '间谍',
  '使者',
  '使节',
  '信使',
  '传令官',
];

// 动作 / 行为短语
const verbPhrases = [
  // 原版保留
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

  // 大量拓展
  '征战',
  '狩猎',
  '追逐',
  '逃离',
  '躲藏',
  '寻找',
  '发现',
  '解锁',
  '收集',
  '制作',
  '锻造',
  '冶炼',
  '打磨',
  '雕刻',
  '绘画',
  '书写',
  '阅读',
  '学习',
  '研究',
  '发明',
  '创造',
  '破坏',
  '摧毁',
  '修复',
  '治愈',
  '祝福',
  '诅咒',
  '施法',
  '吟唱',
  '召唤',
  '驱使',
  '征服',
  '统治',
  '守护',
  '保卫',
  '进攻',
  '撤退',
  '支援',
  '救援',
  '逃离',
  '飞翔',
  '滑翔',
  '冲刺',
  '突袭',
  '埋伏',
  '狙击',
  '强攻',
  '智取',
  '巧夺',
  '豪取',
  '掠夺',
  '收获',
  '耕耘',
  '浇灌',
  '收割',
  '养殖',
  '放牧',
  '捕捉',
  '饲养',
  '驯化',
  '指引',
  '带领',
  '跟随',
  '陪伴',
  '同行',
  '并肩',
  '携手',
  '共战',
  '同行',
  '远征',
  '远航',
  '漫游',
  '流浪',
  '漂泊',
  '定居',
  '筑巢',
  '建家',
  '立业',
  '崛起',
  '征战',
];

// 地点 / 场景 / 地形
const places = [
  // 原版保留
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

  // 大量拓展
  '末地城',
  '下界要塞',
  '地狱堡垒',
  '废弃矿井',
  '海底神殿',
  '丛林神庙',
  '沙漠神殿',
  '雪屋',
  '沼泽小屋',
  '女巫小屋',
  '掠夺者前哨站',
  '林地府邸',
  '沉船',
  '海底废墟',
  '沙漠水井',
  '平原',
  '丘陵',
  '山地',
  '高峰',
  '深渊',
  '浅滩',
  '深海',
  '浅海',
  '湖泊',
  '河流',
  '小溪',
  '瀑布',
  '温泉',
  '熔岩湖',
  '黑森林',
  '繁花森林',
  '针叶林',
  '白桦林',
  '橡木林',
  '丛林',
  '热带草原',
  '恶地',
  '风化沙漠',
  '冻洋',
  '暖水海洋',
  '温水海洋',
  '冷水海洋',
  '冻土',
  '尖峭山峰',
  '冰封山峰',
  '裸岩山峰',
  '雪山',
  '草甸',
  '海岸',
  '石岸',
  '沙滩',
  '雪滩',
  '孤岛',
  '群岛',
  '半岛',
  '大陆',
  '世界',
  '维度',
  '虚空',
  '边境',
  '基地',
  '家园',
  '据点',
  '驿站',
  '酒馆',
  '旅店',
  '驿站',
  '工坊',
  '实验室',
  '图书馆',
  '祭坛',
  '神庙',
  '教堂',
  '宫殿',
  '庭院',
  '广场',
  '街道',
  '小巷',
  '密室',
  '暗道',
  '密道',
  '通道',
  '桥梁',
  '码头',
  '港口',
  '灯塔',
  '瞭望塔',
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
  if (history.value.length > 100) {
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
