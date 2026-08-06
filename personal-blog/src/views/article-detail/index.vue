<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleById, deleteArticle } from '@/services/api/articles'
import { useAuthStore } from '@/stores/modules/auth'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { avatarInitial } from '@/utils/avatar'
import MarkdownIt from 'markdown-it'
import SafeContent from '@/components/safeContent.vue'
import CommentSection from '@/components/CommentSection.vue'
import { ElMessageBox } from 'element-plus'

defineOptions({ name: 'ArticleDetailView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const md = new MarkdownIt({ breaks: true, linkify: true })

const loading = ref(true)
const error = ref('')
const article = ref<API.Articles.Article | null>(null)
const deleting = ref(false)

const id = computed(() => route.params.id as string)
const isOwner = computed(() => article.value?.ownerUid === authStore.uid)
const html = computed(() => (article.value ? md.render(article.value.content) : ''))

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
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.detail-container {
  max-width: 780px;
  margin: 0 auto;
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
  @include reveal;
  font-size: $font-size-body;
  line-height: 1.85;
  color: var(--color-text-primary);
  word-break: break-word;

  // ── 正文排版 ──
  :deep(p) {
    margin: 0 0 20px;
  }

  :deep(h2) {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 32px 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border-light);
    line-height: 1.4;
  }

  :deep(h3) {
    font-size: 19px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 28px 0 10px;
    line-height: 1.4;
  }

  :deep(h4) {
    font-size: $font-size-body;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 24px 0 8px;
    line-height: 1.4;
  }

  :deep(blockquote) {
    margin: 20px 0;
    padding: 12px 20px;
    border-left: 4px solid var(--color-primary);
    background: var(--color-bg-hover);
    border-radius: 0 $radius-md $radius-md 0;
    color: var(--color-text-secondary);
    font-size: 16px;
    line-height: 1.7;

    p {
      margin: 0;
    }
  }

  :deep(pre) {
    margin: 20px 0;
    padding: 16px 20px;
    background: #1e293b;
    color: #e2e8f0;
    border-radius: $radius-md;
    font-size: 14px;
    line-height: 1.6;
    overflow-x: auto;
  }

  :deep(code) {
    &:not(pre code) {
      background: var(--color-bg-hover);
      color: var(--color-danger);
      padding: 2px 6px;
      border-radius: $radius-sm;
      font-size: 0.9em;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 20px;
    padding-left: 24px;
    line-height: 1.85;

    li {
      margin-bottom: 6px;
    }
  }

  :deep(hr) {
    margin: 32px 0;
    border: none;
    border-top: 1px solid var(--color-border-light);
  }

  :deep(a) {
    color: var(--color-primary);
    text-decoration: none;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: $radius-md;
    margin: 20px 0;
    display: block;
  }
}
</style>
