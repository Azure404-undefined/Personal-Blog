<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleById, deleteArticle } from '@/services/api/articles'
import { useAuthStore } from '@/stores/modules/auth'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { avatarInitial } from '@/utils/avatar'
import { slugify, type TocItem } from '@/utils/toc'
import MarkdownIt from 'markdown-it'
import SafeContent from '@/components/safeContent.vue'
import CommentSection from '@/components/CommentSection.vue'
import TocSidebar from '@/components/TocSidebar.vue'
import { ElMessageBox } from 'element-plus'

defineOptions({ name: 'ArticleDetailView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const md = new MarkdownIt({ breaks: true, linkify: true })

// 给标题注入锚点 ID(每次渲染前重置计数器,避免重复标题的 id 冲突)
const headingIdCounts = new Map<string, number>()
md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
  const inline = tokens[idx + 1]
  const text = inline ? inline.content : ''
  let id = slugify(text)
  const count = (headingIdCounts.get(id) || 0) + 1
  headingIdCounts.set(id, count)
  if (count > 1) id = `${id}-${count}`
  tokens[idx]?.attrSet('id', id)
  return self.renderToken(tokens, idx, options)
}

const loading = ref(true)
const error = ref('')
const article = ref<API.Articles.Article | null>(null)
const deleting = ref(false)

const id = computed(() => route.params.id as string)
const isOwner = computed(() => article.value?.ownerUid === authStore.uid)
const html = computed(() => {
  if (!article.value) return ''
  headingIdCounts.clear()
  return md.render(article.value.content)
})

// 从渲染后的 HTML 提取目录(与注入的锚点 id 同源,保证点击跳转一致)
const toc = computed<TocItem[]>(() => {
  if (!html.value) return []
  const doc = new DOMParser().parseFromString(html.value, 'text/html')
  const items: TocItem[] = []
  doc.querySelectorAll('h2, h3, h4').forEach((el) => {
    const anchorId = el.id
    if (anchorId) {
      items.push({ level: Number(el.tagName[1]), text: el.textContent?.trim() || '', id: anchorId })
    }
  })
  return items
})

const fetchArticle = async () => {
  loading.value = true
  error.value = ''
  try {
    article.value = await getArticleById(id.value)
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    if (status === 404) {
      error.value = '文章不存在'
    } else {
      error.value = e instanceof Error ? e.message : '加载失败'
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  deleting.value = true
  try {
    await deleteArticle(id.value)
    router.push('/')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '删除失败'
  } finally {
    deleting.value = false
  }
}

onMounted(fetchArticle)
watch(() => route.params.id, fetchArticle)
</script>

<template>
  <div class="detail-page">
    <!-- loading -->
    <div v-if="loading" class="state-loading">
      <span>加载中...</span>
    </div>

    <!-- error -->
    <div v-else-if="error" class="state-box">
      <p class="state-text error-text">{{ error }}</p>
      <el-button @click="fetchArticle">重试</el-button>
    </div>

    <!-- content -->
    <template v-else-if="article">
      <!-- 有封面: 全宽 banner + 文字叠加 -->
      <template v-if="coverUrl(article.coverImage)">
        <div class="detail-banner">
          <img :src="coverUrl(article.coverImage)" :alt="article.title" class="banner-img" />
          <div class="banner-overlay" />
          <div class="banner-text">
            <el-tag v-if="article.category" size="small" class="banner-tag">
              {{ article.category }}
            </el-tag>
            <h1 class="banner-title">{{ article.title }}</h1>
            <div class="banner-author-row">
              <span class="banner-author-avatar">
                {{ avatarInitial(article.authorName || '博主') }}
              </span>
              <span class="banner-author-name">{{ article.authorName || '博主' }}</span>
            </div>
            <time class="banner-date">{{ fmtDate(article.updatedAt) }}</time>
          </div>
        </div>
      </template>

      <div class="detail-layout">
        <div class="detail-container">
        <!-- 无封面: 原有 header 布局 -->
        <header v-if="!coverUrl(article.coverImage)" class="detail-header">
          <h1 class="detail-title">{{ article.title }}</h1>
          <div class="detail-meta">
            <span class="detail-author-avatar">
              {{ avatarInitial(article.authorName || '博主') }}
            </span>
            <span class="detail-author-name">{{ article.authorName || '博主' }}</span>
            <el-tag v-if="article.category" size="small">{{ article.category }}</el-tag>
            <time>{{ fmtDate(article.updatedAt) }}</time>
          </div>
          <div v-if="isOwner" class="detail-actions">
            <el-button size="small" @click="router.push(`/write?id=${article._id}`)">
              编辑
            </el-button>
            <el-button size="small" type="danger" :loading="deleting" @click="handleDelete">
              删除
            </el-button>
          </div>
        </header>

        <div v-if="coverUrl(article.coverImage) && isOwner" class="banner-actions">
          <el-button size="small" @click="router.push(`/write?id=${article._id}`)">
            编辑
          </el-button>
          <el-button size="small" type="danger" :loading="deleting" @click="handleDelete">
            删除
          </el-button>
        </div>

        <div class="detail-body">
          <SafeContent :html="html" />
        </div>

        <CommentSection :article-id="id" />
        </div>

        <TocSidebar v-if="toc.length" :items="toc" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

// 正文 + 右侧目录 的双栏布局
.detail-layout {
  display: flex;
  justify-content: right;
  align-items: flex-start;
  // gap: $spacing-xl;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.detail-container {
  max-width: 780px;
  min-width: 0;
  flex: 1 1 auto;
  padding: 0 $spacing-md;
}

.state-box {
  @include state-box;
}

.state-loading {
  @include state-spinner;
}
.state-text {
  @include state-text;
}
.error-text {
  @include state-error-text;
}

.detail-header {
  margin-bottom: $spacing-xl;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-title {
  margin: 0 0 10px;
  font-size: $font-size-h1;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.detail-banner {
  position: relative;
  width: 99.7vw;
  margin-left: calc(50% - 50vw);
  margin-top: -$header-height; // 延伸到 header 后方
  height: calc(33vh + $header-height);
  min-height: 252px; // 200 + 52
  max-height: 452px; // 400 + 52
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.banner-img {
  @include cover-img;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  // background: linear-gradient(
  //   to bottom,
  //   rgba(0, 0, 0, 0.3) 0%,
  //   rgba(0, 0, 0, 0.2) 40%,
  //   rgba(0, 0, 0, 0.7) 100%
  // );
  pointer-events: none;
}

.banner-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $header-height $spacing-lg 0;
  text-align: center;
}

.banner-tag {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
}

.banner-title {
  margin: 0;
  font-size: $font-size-display;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.banner-date {
  font-size: $font-size-small;
  color: rgba(255, 255, 255, 0.85);
}

.banner-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  user-select: none;
}

.banner-author-name {
  font-size: $font-size-small;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.banner-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
  margin-bottom: 12px;
}

.detail-author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;
}

.detail-author-name {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-actions {
  display: flex;
  gap: $spacing-sm;
}

.detail-body {
  @include prose-typography;
  @include reveal;
  font-size: $font-size-body;
  line-height: 1.85;
  color: var(--color-text-primary);
  word-break: break-word;

  // 锚点跳转时预留 sticky header + 呼吸空间
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    scroll-margin-top: calc($header-height + $spacing-lg);
  }
}
</style>
