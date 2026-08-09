<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { getArticles } from '@/services/api/articles'
import { Search, Close } from '@element-plus/icons-vue'
import DOMPurify from 'dompurify'
import { excerpt } from '@/utils/text'

defineOptions({ name: 'SearchModal' })

const router = useRouter()
const appStore = useAppStore()

const query = ref('')
const results = ref<API.Articles.Article[]>([])
const loading = ref(false)
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const search = async () => {
  const q = query.value.trim()
  if (!q) {
    results.value = []
    activeIndex.value = 0
    return
  }
  loading.value = true
  try {
    const res = await getArticles({ q, page: 1, pageSize: 8 })
    results.value = res.records
    activeIndex.value = 0
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 300)
}

const close = () => {
  appStore.closeSearchModal()
  query.value = ''
  results.value = []
}

const goTo = (id: string) => {
  close()
  router.push(`/articles/${id}`)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (results.value.length === 0) return
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = results.value[activeIndex.value]
    if (item) {
      goTo(item._id)
    }
  }
}

// 打开时自动 focus + 全局 Ctrl+K
watch(
  () => appStore.showSearchModal,
  (val) => {
    if (val) nextTick(() => inputRef.value?.focus())
    else {
      query.value = ''
      results.value = []
    }
  },
)

const onGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    appStore.openSearchModal()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  if (debounceTimer) clearTimeout(debounceTimer)
})

// DOMPurify 清洗 HTML，<mark> 标签会被保留
const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS: ['mark'] })

const highlight = (text: string, q: string) => {
  if (!q) return sanitizeHtml(text)
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return sanitizeHtml(text.replace(regex, '<mark>$1</mark>'))
}

</script>

<template>
  <Teleport to="body">
    <transition name="search">
      <div v-if="appStore.showSearchModal" class="search-overlay" @click.self="close">
        <div class="search-panel">
          <!-- 搜索头部 -->
          <div class="search-header">
            <el-icon class="search-icon" :size="18"><Search /></el-icon>
            <input
              ref="inputRef"
              v-model="query"
              class="search-input"
              type="text"
              placeholder="搜索文章..."
              @input="debouncedSearch"
              @keydown="onKeydown"
            />
            <button class="search-close" @click="close" aria-label="关闭"><el-icon :size="14"><Close /></el-icon></button>
          </div>

          <!-- 结果列表 -->
          <div v-if="query && results.length" class="search-results">
            <div
              v-for="(item, i) in results"
              :key="item._id"
              class="search-item"
              :class="{ 'is-active': i === activeIndex }"
              @click="goTo(item._id)"
              @mouseenter="activeIndex = i"
            >
              <div class="search-item-title" v-html="highlight(item.title, query)" />
              <div
                class="search-item-excerpt"
                v-html="highlight(excerpt(item.content), query)"
              />
            </div>
          </div>

          <!-- 空结果 -->
          <div v-else-if="query && !loading" class="search-empty">
            未找到相关文章
          </div>

          <!-- Loading -->
          <div v-else-if="loading" class="search-loading">
            <div class="search-spinner" />
          </div>

          <!-- 空闲提示 -->
          <div v-else class="search-hint">
            输入关键词搜索文章标题和内容
          </div>

          <!-- 底部提示 -->
          <div v-if="results.length" class="search-footer">
            <span><kbd>↑↓</kbd> 导航</span>
            <span><kbd>Enter</kbd> 打开</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(1px);
  display: flex;
  justify-content: center;
  padding-top: 12vh;
}

.search-panel {
  width: 560px;
  max-width: 90vw;
  max-height: 70vh;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-light);
}

.search-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: $font-size-body;
  color: var(--color-text-primary);
  background: transparent;
  font-family: inherit;

  &::placeholder {
    color: var(--color-text-placeholder);
  }
}

.search-close {
  width: 24px;
  height: 24px;
  border: none;
  background: var(--color-bg-hover);
  border-radius: 50%;
  font-size: 12px;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }
}

.search-results {
  overflow-y: auto;
  padding: 6px 0;
  flex-shrink: 1;
}

.search-item {
  padding: 10px 18px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover,
  &.is-active {
    background: var(--color-bg-hover);
  }
}

.search-item-title {
  font-size: $font-size-small;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 3px;
  line-height: 1.4;

  :deep(mark) {
    background: rgba(64, 158, 255, 0.2);
    color: var(--color-primary);
    padding: 0 2px;
    border-radius: 2px;
  }
}

.search-item-excerpt {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  :deep(mark) {
    background: rgba(64, 158, 255, 0.15);
    color: var(--color-primary);
    padding: 0 1px;
    border-radius: 2px;
  }
}

.search-empty,
.search-loading,
.search-hint {
  padding: 32px 0;
  text-align: center;
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

.search-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: skeleton-spin 0.8s linear infinite;
  margin: 0 auto;
}

.search-footer {
  display: flex;
  gap: 16px;
  padding: 8px 18px;
  border-top: 1px solid var(--color-border-light);
  font-size: 11px;
  color: var(--color-text-placeholder);

  kbd {
    background: var(--color-bg-hover);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 10px;
  }
}

// ── 动画 ──
.search-enter-active,
.search-leave-active {
  transition: opacity 0.2s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
}

.search-enter-active .search-panel,
.search-leave-active .search-panel {
  transition: transform 0.2s ease;
}

.search-enter-from .search-panel,
.search-leave-to .search-panel {
  transform: scale(0.98);
}
</style>
