<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleById, deleteArticle } from '@/services/api/articles'
import { useAuthStore } from '@/stores/modules/auth'
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

const fmtDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 封面 URL: 兼容 BFF 代理相对路径 /files/... 与绝对 http 地址
const BFF = import.meta.env.VITE_BFF_URL
const coverUrl = (cover?: string) => {
  if (!cover) return ''
  return cover.startsWith('http') ? cover : BFF + cover
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
            <time class="banner-date">{{ fmtDate(article.updatedAt) }}</time>
          </div>
        </div>
      </template>

      <div class="detail-container">
        <!-- 无封面: 原有 header 布局 -->
        <header v-if="!coverUrl(article.coverImage)" class="detail-header">
          <h1 class="detail-title">{{ article.title }}</h1>
          <div class="detail-meta">
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
  width: 100vw;
  margin-left: calc(50% - 50vw);
  height: 33vh;
  min-height: 200px;
  max-height: 400px;
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.banner-img {
  @include cover-img;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.7) 100%
  );
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
  padding: 0 $spacing-lg;
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

.detail-actions {
  display: flex;
  gap: $spacing-sm;
}

.detail-body {
  @include reveal;
  font-size: $font-size-body;
  line-height: 1.8;
  color: var(--color-text-primary);
  word-break: break-word;
}
</style>
