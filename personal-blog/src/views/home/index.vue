<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticles, getCategories } from '@/services/api/articles'
import { Loading } from '@element-plus/icons-vue'

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

const fmtDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
  '#409eff',
  '#67c23a',
  '#e6a23c',
  '#f56c6c',
  '#8e71c7',
  '#20a0ff',
  '#f06292',
  '#00bcd4',
  '#a98173',
  '#5c6bc0',
]

const categoryColor = (cat: string) => {
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

// 封面 URL: 兼容 BFF 代理相对路径 /files/... 与绝对 http 地址
const BFF = import.meta.env.VITE_BFF_URL
const coverUrl = (cover?: string) => {
  if (!cover) return ''
  return cover.startsWith('http') ? cover : BFF + cover
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

    <!-- loading -->
    <div v-if="loading" class="state-box">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载中...</span>
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
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.cat-tag {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background: #ecf5ff;
  }
  &--active {
    color: #fff;
    background: #409eff;
    border-color: #409eff;
    &:hover {
      color: #fff;
      background: #337ecc;
      border-color: #337ecc;
    }
  }
}

.cat-overflow {
  width: 100px;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: #909399;
}
.state-text {
  margin: 0;
  font-size: 15px;
}
.error-text {
  color: #f56c6c;
}

.article-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 640px) {
  .article-list {
    grid-template-columns: 1fr;
  }
}

.article-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
}

.card-cover-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f5f7fa;
}

.card-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8ecf1, #f0f2f5);
}

.card-category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  line-height: 1.6;
  pointer-events: none;
}

.card-body {
  padding: 18px 24px 20px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.card-excerpt {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  font-size: 12px;
  color: #c0c4cc;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
