<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleById } from '@/services/api/articles'
import { createMarkdownRenderer } from '@/utils/markdown'
import { excerpt } from '@/utils/text'
import { usePageMeta } from '@/utils/meta'
import SafeContent from '@/components/safeContent.vue'
import ArticleBanner from './modules/ArticleBanner.vue'
import CommentSection from './modules/CommentSection.vue'
import TocSidebar from './modules/TocSidebar.vue'

defineOptions({ name: 'ArticleDetailView' })

// SEO: 标题/描述随文章变化自动更新
usePageMeta(
  () => article.value?.title || '文章',
  () => (article.value ? excerpt(article.value.content, 150) : ''),
)

const route = useRoute()
const renderer = createMarkdownRenderer()

const loading = ref(true)
const error = ref('')
const article = ref<API.Articles.Article | null>(null)

const id = computed(() => route.params.id as string)
const html = computed(() => (article.value ? renderer.render(article.value.content) : ''))

// 从渲染后的 HTML 提取目录(与注入的锚点 id 同源,保证点击跳转一致)
const toc = computed(() => (html.value ? renderer.extractToc(html.value) : []))

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
      <!-- 封面 banner: 页根渲染,不套 flex,全宽技巧可靠 -->
      <ArticleBanner
        :title="article.title"
        :cover-image="article.coverImage"
        :category="article.category"
        :author-name="article.authorName"
        :updated-at="article.updatedAt"
        :status="article.status"
      />

      <!-- 正文 + 目录: el-row 栅格,左侧占位与目录等宽,正文居中 -->
      <el-row justify="center" :gutter="24">
        <el-col :xs="0" :lg="6" />

        <el-col :xs="24" :lg="12">
          <!-- 正文卡片: 略微上叠 banner,形成层级 -->
          <div class="content-card">
            <div class="detail-body">
              <SafeContent :html="html" />
            </div>
          </div>

          <!-- 评论区卡片: 与正文同风格 -->
          <div class="content-card comment-card">
            <CommentSection :article-id="id" />
          </div>
        </el-col>

        <el-col :xs="24" :lg="6">
          <TocSidebar v-if="toc.length" :items="toc" />
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

// ── 栅格容器 ──
.el-row {
  margin: 0 auto;
}

// ── 正文卡片: 与 banner 略微重叠形成层级 ──
.content-card {
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-sm);
  padding: $spacing-2xl;
  margin-top: -$spacing-lg;
  @include reveal;

  @media (max-width: $breakpoint-sm) {
    margin-top: 0;
    padding: $spacing-lg $spacing-md;
  }
}

// 评论区卡片与正文保持间距
.comment-card {
  margin-top: $spacing-lg;
}

// ── 正文 ──
.detail-body {
  @include prose-typography;
  font-size: $font-size-body;
  line-height: 1.85;
  color: var(--color-text-primary);
  word-break: break-word;

  :deep(h2),
  :deep(h3),
  :deep(h4) {
    scroll-margin-top: calc($header-height + $spacing-lg);
  }
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
</style>
