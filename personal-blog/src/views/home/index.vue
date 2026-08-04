<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticles, getCategories } from '@/services/api/articles'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import HeroSection from '@/components/HeroSection.vue'

defineOptions({ name: 'HomeView' })

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref('')
const articles = ref<API.Articles.Article[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const category = ref('')
const categories = ref<string[]>([])
const MAX_VISIBLE_TABS = 5

const visibleCats = computed(() => categories.value.slice(0, MAX_VISIBLE_TABS))
const overflowCats = computed(() => categories.value.slice(MAX_VISIBLE_TABS))
const showOverflow = computed(() => overflowCats.value.length > 0)

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

const onCategoryChange = () => {
  page.value = 1
  fetchArticles()
}

const onPageChange = (p: number) => {
  page.value = p
  fetchArticles()
}

const excerpt = (md: string, max = 120) => {
  const text = md
    .replace(/[#*>`[\]()!_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max) + '...' : text
}

// 分类 → 稳定颜色(同一分类永远同色)
const CATEGORY_COLORS = [
  'var(--color-cat-0)',
  'var(--color-cat-1)',
  'var(--color-cat-2)',
  'var(--color-cat-3)',
  'var(--color-cat-4)',
  'var(--color-cat-5)',
  'var(--color-cat-6)',
  'var(--color-cat-7)',
  'var(--color-cat-8)',
  'var(--color-cat-9)',
]

const categoryColor = (cat: string) => {
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

onMounted(() => {
  fetchArticles()
  getCategories()
    .then((list) => {
      categories.value = list
    })
    .catch(() => {})
})

// 监听搜索关键词变化(同一路由导航时 onMounted 不触发)
watch(
  () => route.query.q,
  () => {
    page.value = 1
    fetchArticles()
  },
)
</script>

<template>
  <div class="home-page">
    <HeroSection />

    <!-- 分类筛选 -->
    <div v-if="categories.length" class="filter-bar">
      <button
        :class="['cat-tag', { 'cat-tag--active': !category }]"
        @click="category = ''; onCategoryChange()"
      >
        全部
      </button>
      <button
        v-for="cat in visibleCats"
        :key="cat"
        :class="['cat-tag', { 'cat-tag--active': category === cat }]"
        @click="
          category = cat;
          onCategoryChange()
        "
      >
        {{ cat }}
      </button>
      <el-select
        v-if="showOverflow"
        :model-value="overflowCats.includes(category) ? category : ''"
        placeholder="更多"
        size="small"
        class="cat-overflow"
        @change="
          (val: string) => {
            category = val
            onCategoryChange()
          }
        "
      >
        <el-option v-for="cat in overflowCats" :key="cat" :label="cat" :value="cat" />
      </el-select>
    </div>

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
        <article
          v-for="item in articles"
          :key="item._id"
          class="article-card"
          @click="router.push(`/articles/${item._id}`)"
        >
          <div class="card-cover-wrap">
            <img
              v-if="coverUrl(item.coverImage)"
              :src="coverUrl(item.coverImage)"
              :alt="item.title"
              class="card-cover-img"
              loading="lazy"
            />
            <div v-else class="card-cover-fallback" />
            <span
              v-if="item.category"
              class="card-category-badge"
              :style="{ backgroundColor: categoryColor(item.category) }"
              >{{ item.category }}</span
            >
          </div>
          <div class="card-body">
            <h2 class="card-title">{{ item.title }}</h2>
            <p class="card-excerpt">{{ excerpt(item.content) }}</p>
            <time class="card-date">{{ fmtDate(item.createdAt) }}</time>
          </div>
        </article>
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
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.cat-tag {
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  padding: $spacing-xs 14px;
  border-radius: $radius-xl;
  font-size: $font-size-small;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary-border);
    background: var(--color-primary-bg);
  }
  &--active {
    color: #fff;
    background: var(--color-primary);
    border-color: var(--color-primary);
    &:hover {
      color: #fff;
      background: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }
  }
}

.cat-overflow {
  width: 100px;
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

.article-card {
  @include card-base;
  @include reveal;
  cursor: pointer;
}

.card-cover-wrap {
  @include cover-wrap;
}

.card-cover-img {
  @include cover-img;
}

.card-cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-border-light), var(--color-bg-hover));
}

.card-category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 12px;
  border-radius: $radius-sm;
  font-size: $font-size-small;
  font-weight: 500;
  color: #fff;
  line-height: 1.6;
  pointer-events: none;
}

.card-body {
  padding: $spacing-lg;
}

.card-title {
  margin: 0 0 $spacing-sm;
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.card-excerpt {
  margin: 0 0 10px;
  font-size: $font-size-small;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
}

.pagination-wrap {
  @include pagination-wrap;
}

// ── 骨架屏 ──
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
  @include skeleton-cover;
}

.skeleton-body {
  padding: $spacing-lg;
}

.skeleton-line {
  @include skeleton-line;
}
</style>
