<script setup lang="ts">
import { Picture } from '@element-plus/icons-vue'

defineOptions({ name: 'EditorToolbar' })

defineProps<{
  uploading?: boolean
}>()

const emit = defineEmits<{
  command: [cmd: 'bold' | 'italic' | 'strike' | 'code' | 'link' | 'quote']
  'insert-image': []
}>()
</script>

<template>
  <div class="editor-toolbar">
    <button type="button" class="tool-btn" title="粗体 Ctrl+B" @click="emit('command', 'bold')">
      <b>B</b>
    </button>
    <button type="button" class="tool-btn" title="斜体 Ctrl+I" @click="emit('command', 'italic')">
      <i>I</i>
    </button>
    <button type="button" class="tool-btn" title="删除线" @click="emit('command', 'strike')">
      <s>S</s>
    </button>
    <button
      type="button"
      class="tool-btn tool-btn--mono"
      title="行内代码"
      @click="emit('command', 'code')"
    >
      &lt;/&gt;
    </button>
    <button type="button" class="tool-btn" title="链接" @click="emit('command', 'link')">🔗</button>
    <button type="button" class="tool-btn" title="引用" @click="emit('command', 'quote')">❝</button>
    <span class="tool-sep" />
    <button
      type="button"
      class="tool-btn"
      title="插入图片"
      :disabled="uploading"
      @click="emit('insert-image')"
    >
      <el-icon :size="14"><Picture /></el-icon>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 40px; // 与 el-tabs 默认 nav 等高,视觉对齐
  padding: 0 $spacing-sm;
  border-bottom: 2px solid var(--color-border-light);
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &--mono {
    font-family: 'Fira Code', monospace;
    font-size: 11px;
  }
}

.tool-sep {
  display: inline-block;
  width: 1px;
  height: 16px;
  background: var(--color-border);
  margin: 0 4px;
}
</style>
