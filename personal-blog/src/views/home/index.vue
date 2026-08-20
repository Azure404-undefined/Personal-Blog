<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticles, getCategories } from '@/services/api/articles'
import HeroSection from '@/components/HeroSection.vue'
import CategoryFilter from './modules/CategoryFilter.vue'
import ArticleCard from './modules/ArticleCard.vue'
import ProfileSidebar from './modules/ProfileSidebar.vue'
import { usePageMeta } from '@/utils/meta'

defineOptions({ name: 'HomeView' })

usePageMeta('写代码 · 写文章 · 记录生活', 'Azure 的个人博客，记录技术路上的思考与实践')

const route = useRoute()

const loading = ref(true)
const error = ref('')
const articles = ref<API.Articles.Article[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const category = ref((route.query.category as string) || '')
const categories = ref<string[]>([])

const fetchArticles = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getArticles({
      page: page.value,
      pageSize,
      category: category.value || undefined,
      q: (route.query.q as string) || undefined,
    } as API.Articles.getArticleParams)
    articles.value = res.records
    total.value = res.total
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败,请稍后重试'
  } finally {
    loading.value = false
  }
}

const onCategoryChange = (val: string) => {
  category.value = val
  page.value = 1
  fetchArticles()
}

const onPageChange = (p: number) => {
  page.value = p
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
  getCategories()
    .then((list) => {
      categories.value = list
    })
    .catch(() => {})
})

// 监听 query 参数变化
watch(
  () => ({ q: route.query.q, cat: route.query.category }),
  ({ cat }) => {
    category.value = (cat as string) || ''
    page.value = 1
    fetchArticles()
  },
)
</script>

<template>
  <div class="home-page">
    <HeroSection />

    <!-- 桌面: 文章区 + 右侧简介/统计; 移动端: 侧栏隐藏,布局不变 -->
    <el-row :gutter="24">
      <!-- 文章主区 -->
      <el-col :xs="24" :lg="17">
        <!-- 分类筛选：与文章列表共用主列宽度 -->
        <CategoryFilter
          v-if="categories.length"
          :categories="categories"
          v-model="category"
          @update:model-value="onCategoryChange"
        />

        <!-- loading: 骨架屏 -->
        <div v-if="loading" class="skeleton-grid">
          <div v-for="n in 4" :key="n" class="skeleton-card">
            <div class="skeleton-cover" />
            <div class="skeleton-body">
              <div class="skeleton-line" style="width:80%" />
              <div class="skeleton-line" style="width:60%" />
              <div class="skeleton-line" style="width:40%" />
            </div>
          </div>
        </div>

        <!-- error -->
        <div v-else-if="error" class="state-box">
          <p class="state-text error-text">{{ error }}</p>
          <el-button @click="fetchArticles">重试</el-button>
        </div>

        <!-- empty -->
        <div v-else-if="!articles.length" class="state-box">
          <p class="state-text">还没有文章</p>
        </div>

        <!-- list -->
        <template v-else>
          <div class="article-list">
            <ArticleCard v-for="item in articles" :key="item._id" :article="item" />
          </div>

          <div v-if="total > pageSize" class="pagination-wrap">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page="page"
              @current-change="onPageChange"
            />
          </div>
        </template>
      </el-col>

      <!-- 右侧简介 + 统计 -->
      <el-col :xs="0" :lg="7">
        <ProfileSidebar :article-count="total" :category-count="categories.length" />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.state-box {
  @include state-box;
}
.state-text {
  @include state-text;
}
.error-text {
  @include state-error-text;
}

.article-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;
}

@media (max-width: $breakpoint-sm) {
  .article-list {
    grid-template-columns: 1fr;
  }
}

.pagination-wrap {
  @include pagination-wrap;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-lg;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  overflow: hidden;
}

.skeleton-cover {
  @include skeleton-cover(200px);
}

.skeleton-body {
  padding: $spacing-lg;
}

.skeleton-line {
  @include skeleton-line;
}
</style>
