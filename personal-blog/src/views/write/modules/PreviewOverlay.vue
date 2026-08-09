<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { Close } from '@element-plus/icons-vue'
import ArticleContent from './ArticleContent.vue'

defineOptions({ name: 'PreviewOverlay' })

const props = defineProps<{
  modelValue: boolean
  title: string
  html: string
  coverImage?: string
  category?: string
  authorName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => emit('update:modelValue', false)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- 预览覆盖层: 手动实现 + 过渡动画,避开 el-dialog 动画闪烁 -->
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="modelValue" class="preview-overlay" @click.self="close">
        <Transition name="preview-slide" appear>
          <div class="preview-card" @click.stop>
            <div class="preview-toolbar">
              <span class="preview-title">文章预览</span>
              <el-button size="small" circle @click="close" aria-label="关闭预览">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="preview-body">
              <ArticleContent
                contained
                :title="title"
                :html="html"
                :cover-image="coverImage"
                :category="category"
                :author-name="authorName"
                :updated-at="Date.now()"
              />
              <p v-if="!html" class="preview-hint">正文还没有内容</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
}

// 遮罩: fade
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.25s ease;
}
.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

// 卡片: 从上滑入
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.preview-slide-enter-from,
.preview-slide-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

.preview-card {
  width: 100%;
  max-width: 780px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.preview-title {
  font-size: $font-size-small;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-md;
}

.preview-hint {
  margin: 0;
  padding: $spacing-lg;
  text-align: center;
  color: var(--color-text-placeholder);
  font-size: $font-size-small;
}
</style>
