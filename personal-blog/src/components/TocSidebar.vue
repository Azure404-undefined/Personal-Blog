<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { TocItem } from '@/utils/toc'

defineOptions({ name: 'TocSidebar' })

const props = defineProps<{
  items: TocItem[]
}>()

const activeId = ref('')
const mobileOpen = ref(false)

// 滚动时高亮当前章节: 最后一个顶部越过阈值的标题
const onScroll = () => {
  const threshold = 120
  let current = ''
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= threshold) {
      current = item.id
    } else {
      break // 文档顺序,越过阈值后不可能再回头
    }
  }
  activeId.value = current
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  mobileOpen.value = false
}

let rafId = 0
const onScrollThrottled = () => {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(onScroll)
}

const bindScroll = () => {
  onScroll()
  window.addEventListener('scroll', onScrollThrottled, { passive: true })
}

watch(() => props.items, bindScroll)
onMounted(bindScroll)
onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', onScrollThrottled)
})
</script>

<template>
  <!-- 桌面端: 右侧 sticky 侧栏 -->
  <aside v-if="items.length" class="toc-sidebar">
    <div class="toc-title">目录</div>
    <nav class="toc-list">
      <button
        v-for="item in items"
        :key="item.id"
        :class="[
          'toc-link',
          `toc-link--lv${item.level}`,
          { 'toc-link--active': activeId === item.id },
        ]"
        @click="scrollTo(item.id)"
      >
        {{ item.text }}
      </button>
    </nav>
  </aside>

  <!-- 移动端: 浮动按钮 + 弹出面板 -->
  <div v-if="items.length" class="toc-float">
    <transition name="toc-fade">
      <div v-if="mobileOpen" class="toc-backdrop" @click="mobileOpen = false" />
    </transition>
    <transition name="toc-pop">
      <div v-if="mobileOpen" class="toc-popup">
        <div class="toc-title">目录</div>
        <nav class="toc-list">
          <button
            v-for="item in items"
            :key="item.id"
            :class="[
              'toc-link',
              `toc-link--lv${item.level}`,
              { 'toc-link--active': activeId === item.id },
            ]"
            @click="scrollTo(item.id)"
          >
            {{ item.text }}
          </button>
        </nav>
      </div>
    </transition>
    <button
      class="toc-fab"
      :class="{ 'toc-fab--active': mobileOpen }"
      aria-label="文章目录"
      @click="mobileOpen = !mobileOpen"
    >
      <el-icon :size="18"><Document /></el-icon>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.toc-sidebar {
  display: none; // 桌面端由 media query 开启
}

.toc-title {
  font-size: $font-size-small;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: $spacing-sm;
  letter-spacing: 0.5px;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 60vh;
  overflow-y: auto;
}

.toc-link {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  padding: 5px 10px;
  border-radius: $radius-sm;
  font-size: $font-size-small;
  line-height: 1.5;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &--lv3 {
    padding-left: 20px;
  }

  &--lv4 {
    padding-left: 30px;
  }

  &--active {
    color: var(--color-primary);
    font-weight: 600;
    background: var(--color-primary-bg);
  }
}

// ── 移动端: 浮动按钮 ──
.toc-float {
  display: none;
}

// 点击空白关闭的遮罩
.toc-backdrop {
  position: fixed;
  inset: 0;
  z-index: 98; // 低于 popup(99),高于页面内容
  background: rgba(0, 0, 0, 0.3);
}

.toc-fade-enter-active,
.toc-fade-leave-active {
  transition: opacity 0.2s;
}
.toc-fade-enter-from,
.toc-fade-leave-to {
  opacity: 0;
}

.toc-fab {
  position: fixed;
  right: 32px;
  bottom: 88px; // BackToTop(40px+32px) 上方
  z-index: 99;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition:
    background 0.15s,
    color 0.15s;

  &:hover,
  &--active {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }
}

.toc-popup {
  position: fixed;
  right: 32px;
  bottom: 140px;
  z-index: 99;
  width: 240px;
  max-height: 50vh;
  overflow-y: auto;
  padding: $spacing-md;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  box-shadow: var(--shadow-lg);
}

.toc-pop-enter-active,
.toc-pop-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.toc-pop-enter-from,
.toc-pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

// ── 响应式 ──
@media (min-width: $breakpoint-lg) {
  .toc-sidebar {
    display: block;
    position: sticky;
    top: calc($header-height + $spacing-lg);
    align-self: flex-start;
    flex-shrink: 0;
    width: 150px;
    padding: $spacing-md $spacing-sm;
    border-left: 1px solid var(--color-border-light);
  }
}

@media (max-width: ($breakpoint-lg - 1px)) {
  .toc-float {
    display: block;
  }
}
</style>
