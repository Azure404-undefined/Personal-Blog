<script setup lang="ts">
import { computed } from 'vue'

export type UploadStage = 'compressing' | 'uploading' | 'processing'

defineOptions({ name: 'UploadProgress' })

const props = defineProps<{
  /** 0-99 确定值；-1 表示不确定阶段（压缩中/处理中） */
  percent: number
  stage: UploadStage
}>()

const stageText = computed(() => {
  switch (props.stage) {
    case 'compressing':
      return '压缩中…'
    case 'processing':
      return '处理中…'
    default:
      return `上传中 ${props.percent}%`
  }
})

const indeterminate = computed(() => props.stage !== 'uploading')
</script>

<template>
  <div class="upload-progress" role="status" :aria-label="stageText">
    <span class="up-text">{{ stageText }}</span>
    <span class="up-track" :class="{ 'up-track--indeterminate': indeterminate }">
      <span class="up-fill" :style="{ width: indeterminate ? '40%' : `${percent}%` }"></span>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.upload-progress {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  min-width: 0;
}

.up-text {
  color: var(--color-text-muted);
  font-size: 12px;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  white-space: nowrap;
}

.up-track {
  position: relative;
  width: 90px;
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary-bg);
  overflow: hidden;
}

.up-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--color-primary);
  transition: width 0.15s ease;
}

/* 不确定阶段：渐变块左右滑动 */
.up-track--indeterminate .up-fill {
  position: absolute;
  animation: up-slide 1.2s ease-in-out infinite;
}

@keyframes up-slide {
  0% {
    left: -40%;
  }

  100% {
    left: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .up-track--indeterminate .up-fill {
    animation: none;
    left: 0;
  }
}
</style>
