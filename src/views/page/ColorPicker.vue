<template>
  <div class="wrap" @paste="handlePaste">
    <div class="card">
      <h1>颜色选取器</h1>
      <p class="lead">ctrl + v 粘贴任意颜色格式（Hex、RGB、RGBA、HSL等）自动识别</p>

      <div class="picker-container" @click="triggerColorPicker">
        <input
          type="color"
          v-model="colorValue"
          @input="updateColor"
          class="color-picker"
          ref="colorPickerRef" />
        <div class="color-preview" :style="{ backgroundColor: colorValue }"></div>
      </div>

      <div class="color-formats">
        <div class="format-item">
          <label>HEX</label>
          <div class="format-value">
            <input type="text" :value="formats.hex" readonly @click="copyFormat(formats.hex)" />
            <button @click="copyFormat(formats.hex)" class="x-btn copy-btn">📋</button>
          </div>
        </div>

        <div class="format-item">
          <label>RGB</label>
          <div class="format-value">
            <input type="text" :value="formats.rgb" readonly @click="copyFormat(formats.rgb)" />
            <button @click="copyFormat(formats.rgb)" class="x-btn copy-btn">📋</button>
          </div>
        </div>

        <div class="format-item">
          <label>RGBA</label>
          <div class="format-value">
            <input type="text" :value="formats.rgba" readonly @click="copyFormat(formats.rgba)" />
            <button @click="copyFormat(formats.rgba)" class="x-btn copy-btn">📋</button>
          </div>
        </div>

        <div class="format-item">
          <label>HSL</label>
          <div class="format-value">
            <input type="text" :value="formats.hsl" readonly @click="copyFormat(formats.hsl)" />
            <button @click="copyFormat(formats.hsl)" class="x-btn copy-btn">📋</button>
          </div>
        </div>

        <div class="format-item">
          <label>HSLA</label>
          <div class="format-value">
            <input type="text" :value="formats.hsla" readonly @click="copyFormat(formats.hsla)" />
            <button @click="copyFormat(formats.hsla)" class="x-btn copy-btn">📋</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';

const colorValue = ref('#667eea');
const colorPickerRef = ref<HTMLInputElement | null>(null);

interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
}

const formats = computed<ColorFormats>(() => {
  const hex = colorValue.value;
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
  };
});

const updateColor = () => {
  // 颜色更新时不显示提示
};

const triggerColorPicker = () => {
  colorPickerRef.value?.click();
};

const parseColorFromText = (text: string): string | null => {
  text = text.trim();

  // HEX格式: #RGB, #RRGGBB, #RRGGBBAA
  const hexMatch = text.match(/#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (hex.length === 8) {
      hex = hex.substring(0, 6);
    }
    return '#' + hex;
  }

  // RGB/RGBA格式
  const rgbMatch = text.match(
    /rgba?\s*\(\s*(\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)\s*(?:,?\s*([\d.]+))?\s*\)/i
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      return rgbToHex(r, g, b);
    }
  }

  // 无格式的RGB数字: 255 128 64 或 255,128,64
  const plainRgbMatch = text.match(/(\d+)\s*[,\s]\s*(\d+)\s*[,\s]\s*(\d+)/);
  if (plainRgbMatch) {
    const r = parseInt(plainRgbMatch[1]);
    const g = parseInt(plainRgbMatch[2]);
    const b = parseInt(plainRgbMatch[3]);
    if (r <= 255 && g <= 255 && b <= 255) {
      return rgbToHex(r, g, b);
    }
  }

  // HSL/HSLA格式
  const hslMatch = text.match(
    /hsla?\s*\(\s*(\d+)\s*,?\s*(\d+)%?\s*,?\s*(\d+)%?\s*(?:,?\s*([\d.]+))?\s*\)/i
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    if (h <= 360 && s <= 100 && l <= 100) {
      const rgb = hslToRgb(h, s, l);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
  }

  return null;
};

const handlePaste = async (e: ClipboardEvent) => {
  e.preventDefault();

  const text = e.clipboardData?.getData('text');
  if (!text) return;

  const parsedColor = parseColorFromText(text);
  if (parsedColor) {
    colorValue.value = parsedColor;
    message.success(`已识别颜色: ${text}`);
  } else {
    message.warning('未识别到有效的颜色格式');
  }
};

const handleGlobalPaste = (e: ClipboardEvent) => {
  handlePaste(e);
};

const copyFormat = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    message.success(`已复制: ${value}`);
  } catch {
    message.error('复制失败');
  }
};

// 颜色转换函数
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

onMounted(() => {
  document.addEventListener('paste', handleGlobalPaste);
});

onUnmounted(() => {
  document.removeEventListener('paste', handleGlobalPaste);
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
  overflow: auto;
}

.card {
  width: 100%;
  max-width: 760px;
  background: var(--card-bg, #fff);
  border-radius: 12px;
  border: var(--card-border);
  /* box-shadow: 0 8px 30px rgba(16, 24, 40, 0.06); */
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

.picker-container {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #eef2f6;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.picker-container:hover {
  /* border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1); */
}

[data-theme='dark'] .picker-container {
  background: #1e293b;
  border-color: #334155;
}
label {
  margin-left: 5px;
}
[data-theme='dark'] .picker-container:hover {
  /* border-color: #764ba2; */
}

.color-picker {
  width: 80px;
  height: 80px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  pointer-events: none;
  position: absolute;
  opacity: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  /* border: 3px solid #fff; */
  border-radius: 12px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
}

.color-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
  /* border: 3px solid #fff; */
  transition: all 0.2s;
}

.picker-container:hover .color-preview {
  /* transform: scale(1.02); */
}

.color-formats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.format-item label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-light, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format-value {
  display: flex;
  gap: 8px;
  align-items: center;
}

.format-value input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e6e9ef;
  border-radius: 12px;
  font-size: 14px;
  /* font-family: 'Courier New', monospace; */
  background: var(--card-bg, #fff);
  color: var(--text-color, #0f172a);
  cursor: pointer;
  transition: all 0.2s;
}

.format-value input:hover {
  /* border-color: #667eea; */
  background: var(--card-bg-hover);
}

.format-value input:focus {
  outline: none;
  border-color: #667eea;
}

[data-theme='dark'] .format-value input {
  border-color: #334155;
}

.copy-btn {
  display: none;
}
</style>
