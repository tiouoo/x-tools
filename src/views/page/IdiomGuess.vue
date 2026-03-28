<template>
  <div class="wrap">
    <div class="card">
      <h1>Emoji猜成语</h1>

      <!-- 未开始游戏 -->
      <div v-if="!gameStarted" class="start-screen">
        <div class="start-icon">🎮</div>
        <div class="start-text">准备好猜成语了吗？</div>
        <div class="start-desc">共有 {{ totalIdioms }} 个成语等你挑战</div>
        <button @click="startGame" class="start-btn">开始游戏</button>
      </div>

      <!-- 游戏进行中 -->
      <template v-else>
        <div class="stats-bar">
          <span class="stat-item">总共: {{ totalIdioms }}</span>
          <span class="stat-item">已完成: {{ completedCount }}</span>
          <span class="stat-item">剩余: {{ remainingCount }}</span>
        </div>

        <div v-if="currentIdiom" class="game-area">
          <div class="emoji-display">{{ currentIdiom.emoji }}</div>

          <div class="input-box">
            <input
              v-model="userInput"
              type="text"
              placeholder="输入成语..."
              class="idiom-input"
              maxlength="4"
              @input="checkAnswer" />
          </div>

          <div v-if="showResult" class="result-message" :class="resultClass">
            {{ resultMessage }}
          </div>

          <div class="action-buttons">
            <button @click="skipIdiom" class="skip-btn">跳过</button>
          </div>
        </div>

        <div v-else class="complete-message">
          <div class="complete-icon">🎉</div>
          <div class="complete-text">恭喜完成所有成语！</div>
          <button @click="resetGame" class="reset-btn">重新开始</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Idiom {
  text: string;
  emoji: string;
}

const idioms: Idiom[] = [
  // 原有优化版
  { text: '一帆风顺', emoji: '1️⃣🌊🚢🍀' },
  { text: '七上八下', emoji: '7️⃣⬆️8️⃣⬇️' },
  { text: '九牛一毛', emoji: '9️⃣🐂1️⃣🐑' },
  { text: '十全十美', emoji: '🔟💯🔟🥰' },
  { text: '百发百中', emoji: '💯🎯💯✅' },
  { text: '千军万马', emoji: '👥🏃🐎💨' },
  { text: '万众一心', emoji: '👥🌍1️⃣❤️' },
  { text: '三心二意', emoji: '3️⃣❤️2️⃣🤔' },
  { text: '四面八方', emoji: '4️⃣⬅️8️⃣📍' },
  { text: '五颜六色', emoji: '5️⃣🎨6️⃣🌈' },
  { text: '六神无主', emoji: '6️⃣😱😵‍💫❓' },
  { text: '八仙过海', emoji: '8️⃣🧙🌊🚢' },
  { text: '画蛇添足', emoji: '🎨🐍🦶❌' },
  { text: '守株待兔', emoji: '🌳⏳🚶🐰' },
  { text: '刻舟求剑', emoji: '✍️🚢🔍🗡️' },
  { text: '掩耳盗铃', emoji: '🙈👂🥷🔔' },
  { text: '亡羊补牢', emoji: '🐑💨🔧🏠' },
  { text: '杯弓蛇影', emoji: '🍷🏹🐍👤' },
  { text: '对牛弹琴', emoji: '👉🐂🎹🎵' },
  { text: '井底之蛙', emoji: '🕳️🐸🌍💧' },
  { text: '狐假虎威', emoji: '🦊🐯👑💪' },
  { text: '鸡犬不宁', emoji: '🐔🐶😫🔇' },
  { text: '龙飞凤舞', emoji: '🐉✈️🦅💃' },
  { text: '虎头蛇尾', emoji: '🐯👤🐍🦘' },
  { text: '鱼目混珠', emoji: '🐟👁️🔀💎' },
  { text: '鸟语花香', emoji: '🐦🎶🌸🌿' },
  { text: '马到成功', emoji: '🐎➡️✅🏆' },
  { text: '羊入虎口', emoji: '🐑➡️🐯👄' },
  { text: '猴年马月', emoji: '🐵📅🐴🌙' },
  { text: '鸡飞狗跳', emoji: '🐔✈️🐕🦘' },
  { text: '狼吞虎咽', emoji: '🐺😋🐯🍽️' },
  { text: '鹤立鸡群', emoji: '🦩🧍🐔👥' },
  { text: '鼠目寸光', emoji: '🐭👁️📏💡' },
  { text: '牛头马面', emoji: '🐮👤🐴😐' },
  { text: '虎背熊腰', emoji: '🐯🔙🐻💪' },
  { text: '兔死狐悲', emoji: '🐰💀🦊😢' },
  { text: '龙马精神', emoji: '🐉🐴✨🧠' },
  { text: '蛇蝎心肠', emoji: '🐍🦂❤️🫀' },
  { text: '马首是瞻', emoji: '🐴👤👀🔝' },
  { text: '羊肠小道', emoji: '🐑🫀🤏🛤️' },
  { text: '鸡毛蒜皮', emoji: '🐔🪶🧄🧅' },
  { text: '狗急跳墙', emoji: '🐕😰🦘🧱' },
  { text: '猪狗不如', emoji: '🐷🐕❌👍' },
  { text: '一箭双雕', emoji: '1️⃣🏹2️⃣🦅' },
  { text: '一石二鸟', emoji: '1️⃣🪨2️⃣🐦' },
  { text: '一鸣惊人', emoji: '1️⃣🔊😱👤' },
  { text: '一目十行', emoji: '1️⃣👁️🔟📄' },
  { text: '一见钟情', emoji: '1️⃣👀💘❤️' },
  { text: '一举两得', emoji: '1️⃣🙌2️⃣✅' },
  { text: '画龙点睛', emoji: '🎨🐉👁️✨' },
  { text: '二话不说', emoji: '2️⃣🤫✋🤐' },
  { text: '三长两短', emoji: '3️⃣📏2️⃣✂️' },
  { text: '四分五裂', emoji: '4️⃣💥5️⃣👥' },
  { text: '五光十色', emoji: '5️⃣💎🔟✨' },
  { text: '六亲不认', emoji: '6️⃣👨‍👩‍👧‍👦❌👋' },
  { text: '八面玲珑', emoji: '8️⃣🌪️👤✨' },
  { text: '九死一生', emoji: '9️⃣💀1️⃣❤️' },
  { text: '百依百顺', emoji: '💯🙆💯🙆‍♂️' },
  { text: '千方百计', emoji: '🔢📋💡🤔' },
  { text: '万无一失', emoji: '🌍✅❌⚠️' },

  { text: '欢天喜地', emoji: '😄🎉🎊🥳' },
  { text: '兴高采烈', emoji: '🥳🎈✨😊' },
  { text: '心花怒放', emoji: '❤️🌸💥😆' },
  { text: '喜气洋洋', emoji: '🎉🎊🥰🌟' },
  { text: '眉开眼笑', emoji: '😊👀😃😄' },
  { text: '捧腹大笑', emoji: '😂🤣🙌🎉' },
  { text: '怡然自得', emoji: '😌☕🍃☀️' },
  { text: '无忧无虑', emoji: '😌☁️❌😟' },

  { text: '风调雨顺', emoji: '🌬️🌧️☀️🍀' },
  { text: '安居乐业', emoji: '🏠👨‍👩‍👧‍👦🍚😊' },
  { text: '丰衣足食', emoji: '👕🍚🥢✅' },
  { text: '长治久安', emoji: '🛡️⏳🏠✅' },

  { text: '人山人海', emoji: '👥👥🌊🚶' },
  { text: '车水马龙', emoji: '🚗🚦🐎💨' },
  { text: '川流不息', emoji: '🌊🚶‍♀️🚶‍♂️💨' },
  { text: '门庭若市', emoji: '🚪👥🏪🎉' },
  { text: '络绎不绝', emoji: '👥🔗🚶‍♀️🚶' },
  { text: '摩肩接踵', emoji: '👤👤👥👥' },

  { text: '纸上谈兵', emoji: '📄✍️⚔️🤔' },
  { text: '南辕北辙', emoji: '🧭⬅️➡️🚗' },
  { text: '自相矛盾', emoji: '🗡️🛡️🤦‍♂️❌' },
  { text: '买椟还珠', emoji: '📦💎↩️👋' },
  { text: '邯郸学步', emoji: '👣👣🚶❌' },
  { text: '杞人忧天', emoji: '👤😟☁️🌧️' },
  { text: '井底观天', emoji: '🕳️👀☁️🌤️' },
  { text: '叶公好龙', emoji: '👤🐉❤️❌' },

  { text: '如鱼得水', emoji: '🐟💧🌊😌' },
  { text: '如虎添翼', emoji: '🐯🦅💪✈️' },
  { text: '如日中天', emoji: '☀️🌤️⭐🌟' },
  { text: '如花似玉', emoji: '🌸💎👩✨' },
  { text: '如火如荼', emoji: '🔥🌹📈✨' },
  { text: '如胶似漆', emoji: '🩹🔗❤️👥' },

  { text: '乘风破浪', emoji: '🌊🚢💨🌪️' },
  { text: '披荆斩棘', emoji: '🌿✂️🗡️🚶' },
  { text: '勇往直前', emoji: '🚶‍♂️➡️💪🌟' },
  { text: '百折不挠', emoji: '💪↩️✅🔥' },
  { text: '自强不息', emoji: '💪🔝❤️🔥' },
  { text: '坚韧不拔', emoji: '⛰️💪❤️🔒' },
  { text: '奋不顾身', emoji: '🔥🏃‍♂️🛡️❤️' },

  { text: '正大光明', emoji: '☀️👀✨👍' },
  { text: '大公无私', emoji: '🤝❤️👥👍' },
  { text: '助人为乐', emoji: '🤝👫😊❤️' },
  { text: '拾金不昧', emoji: '💰🙅‍♂️👮✅' },
  { text: '见义勇为', emoji: '🛡️👮‍♂️❤️👍' },
  { text: '光明磊落', emoji: '☀️🧱✨👍' },
  { text: '廉洁奉公', emoji: '💰❌🏛️🤝' },

  { text: '花好月圆', emoji: '🌸🌕✨🥮' },
  { text: '春暖花开', emoji: '🌸☀️🌱🌿' },
  { text: '秋高气爽', emoji: '🍂☀️☁️😌' },
  { text: '冰天雪地', emoji: '❄️🌨️🏔️🥶' },
  { text: '山清水秀', emoji: '🏞️🏔️💧🌿' },
  { text: '姹紫嫣红', emoji: '🌸🌹🌺🌈' },
  { text: '崇山峻岭', emoji: '🏔️🏔️⛰️🌿' },

  { text: '才高八斗', emoji: '📚🧠💡🏆' },
  { text: '学富五车', emoji: '📚🚗🧠✨' },
  { text: '博古通今', emoji: '📜⏳🧠🌍' },
  { text: '出口成章', emoji: '👄📄✍️🏆' },
  { text: '妙笔生花', emoji: '✍️🖊️🌸✨' },
  { text: '才华横溢', emoji: '🧠✨🌟📚' },

  { text: '志同道合', emoji: '🧭❤️👥🤝' },
  { text: '情同手足', emoji: '👥🤝❤️👬' },
  { text: '肝胆相照', emoji: '❤️🫂🤝🔒' },
  { text: '风雨同舟', emoji: '🌧️🚢👥🤝' },
  { text: '生死与共', emoji: '❤️💀👥🔒' },

  { text: '大公无私', emoji: '🤝❤️👥👍' },
  { text: '克己奉公', emoji: '🙅‍♂️💰🏛️🤝' },
  { text: '高风亮节', emoji: '🌬️⭐🏮✨' },
  { text: '德高望重', emoji: '🧓❤️👥🏆' },

  { text: '惊天动地', emoji: '🌍💥☁️⚡' },
  { text: '翻天覆地', emoji: '🌍🔄💥🏚️' },
  { text: '开天辟地', emoji: '✂️🌌🌍☀️' },
  { text: '顶天立地', emoji: '🧍‍♂️☁️🌍💪' },

  { text: '大同小异', emoji: '👍👥🤏❌' },
  { text: '扬长避短', emoji: '👍👋❌👋' },
  { text: '弄巧成拙', emoji: '🤲✨❌😓' },
  { text: '喜新厌旧', emoji: '❤️✨👋⏳' },
];

const gameStarted = ref(false);
const userInput = ref('');
const showResult = ref(false);
const resultMessage = ref('');
const resultClass = ref('');
const completedIdioms = ref<Set<number>>(new Set());
const remainingIndices = ref<number[]>([]);
const currentIndex = ref<number | null>(null);

const totalIdioms = computed(() => idioms.length);
const completedCount = computed(() => completedIdioms.value.size);
const remainingCount = computed(() => remainingIndices.value.length);

const currentIdiom = computed(() => {
  if (currentIndex.value === null) return null;
  return idioms[currentIndex.value];
});

// 洗牌算法
const shuffleArray = (array: number[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 开始游戏
const startGame = () => {
  const indices = Array.from({ length: idioms.length }, (_, i) => i);
  remainingIndices.value = shuffleArray(indices);
  completedIdioms.value.clear();
  gameStarted.value = true;
  nextIdiom();
};

// 初始化游戏
const initGame = () => {
  gameStarted.value = false;
  userInput.value = '';
  showResult.value = false;
  currentIndex.value = null;
  remainingIndices.value = [];
  completedIdioms.value.clear();
};

// 下一个成语
const nextIdiom = () => {
  if (remainingIndices.value.length === 0) {
    currentIndex.value = null;
    return;
  }
  currentIndex.value = remainingIndices.value[0];
  userInput.value = '';
  showResult.value = false;
};

// 检查答案
const checkAnswer = () => {
  if (!currentIdiom.value || userInput.value.length !== 4) {
    showResult.value = false;
    return;
  }

  if (userInput.value === currentIdiom.value.text) {
    resultMessage.value = '✅ 正确！';
    resultClass.value = 'correct';
    showResult.value = true;

    // 标记为已完成
    completedIdioms.value.add(currentIndex.value!);
    remainingIndices.value.shift();

    // 延迟进入下一题
    setTimeout(() => {
      nextIdiom();
    }, 800);
  } else {
    resultMessage.value = '❌ 再想想';
    resultClass.value = 'incorrect';
    showResult.value = true;
  }
};

// 跳过当前成语
const skipIdiom = () => {
  if (currentIndex.value === null || remainingIndices.value.length === 0) return;

  // 将当前成语移到列表末尾
  const skippedIndex = remainingIndices.value.shift()!;
  remainingIndices.value.push(skippedIndex);

  // 进入下一题
  userInput.value = '';
  showResult.value = false;
  currentIndex.value = remainingIndices.value[0];
};

// 重置游戏
const resetGame = () => {
  initGame();
};

onMounted(() => {
  initGame();
});
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
  max-width: 600px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(16, 24, 40, 0.06);
  padding: 28px;
  margin-bottom: 55px;
}

h1 {
  margin: 0 0 20px;
  font-size: 20px;
  color: var(--text-color, #0f172a);
  text-align: center;
}

.start-screen {
  text-align: center;
  padding: 40px 20px;
}

.start-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.start-text {
  font-size: 20px;
  color: var(--text-color, #0f172a);
  margin-bottom: 12px;
}

.start-desc {
  font-size: 14px;
  color: var(--text-color-light, #6b7280);
  margin-bottom: 32px;
}

.start-btn {
  background: #667eea;
  color: #fff;
  border: 0;
  padding: 14px 48px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  font-family: inherit;
}

.start-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

[data-theme='dark'] .stats-bar {
  background: #1e293b;
}

.stat-item {
  font-size: 14px;
  color: var(--text-color, #0f172a);
}

.game-area {
  text-align: center;
}

.emoji-display {
  font-size: 64px;
  margin: 32px 0;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-box {
  margin-bottom: 16px;
}

.idiom-input {
  width: 100%;
  max-width: 300px;
  padding: 14px 18px;
  border: 2px solid #e6e9ef;
  border-radius: 8px;
  font-size: 20px;
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  outline: none;
  transition: border-color 0.2s;
  text-align: center;
  font-family: inherit;
  letter-spacing: 8px;
}

.idiom-input:focus {
  border-color: #667eea;
}

[data-theme='dark'] .idiom-input {
  border-color: #334155;
}

[data-theme='dark'] .idiom-input:focus {
  border-color: #764ba2;
}

.result-message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-message.correct {
  background: #d1fae5;
  color: #065f46;
}

[data-theme='dark'] .result-message.correct {
  background: #064e3b;
  color: #6ee7b7;
}

.result-message.incorrect {
  background: #fee2e2;
  color: #991b1b;
}

[data-theme='dark'] .result-message.incorrect {
  background: #7f1d1d;
  color: #fca5a5;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.skip-btn {
  background: #f59e0b;
  color: #fff;
  border: 0;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.skip-btn:hover {
  background: #d97706;
}

.complete-message {
  text-align: center;
  padding: 40px 20px;
}

.complete-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.complete-text {
  font-size: 20px;
  color: var(--text-color, #0f172a);
  margin-bottom: 24px;
}

.reset-btn {
  background: #667eea;
  color: #fff;
  border: 0;
  padding: 12px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  font-family: inherit;
}

.reset-btn:hover {
  background: #5568d3;
}
</style>
