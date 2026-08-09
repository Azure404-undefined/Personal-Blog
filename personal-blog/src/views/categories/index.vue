<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles, getCategories } from '@/services/api/articles'
import { categoryColor } from '@/utils/category'
import HeroSection from '@/components/HeroSection.vue'
import { usePageMeta } from '@/utils/meta'

defineOptions({ name: 'CategoriesView' })

usePageMeta('分类浏览', '按分类浏览 Azure 的博客文章')

interface CategoryWithCount {
  name: string
  count: number
}

const router = useRouter()
const loading = ref(true)
const error = ref('')
const categories = ref<CategoryWithCount[]>([])

const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    const names = await getCategories()
    // 并行取每个分类的文章数(博客规模小,N+1 可接受)
    const withCount = await Promise.all(
      names.map(async (name) => {
        try {
          const res = await getArticles({ page: 1, pageSize: 1, category: name })
          return { name, count: res.total }
        } catch {
          return { name, count: 0 }
        }
      }),
    )
    categories.value = withCount
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败,请稍后重试'
  } finally {
    loading.value = false
  }
}

const goCategory = (name: string) => {
  router.push({ path: '/', query: { category: name } })
}

onMounted(fetchCategories)
</script>

<template>
  <div class="categories-page">
    <HeroSection mini title="分类" />

    <!-- loading: 骨架屏 -->
    <div v-if="loading" class="skeleton-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-line" style="width: 50%" />
        <div class="skeleton-line" style="width: 30%" />
      </div>
    </div>

    <!-- error -->
    <div v-else-if="error" class="state-box">
      <p class="state-text error-text">{{ error }}</p>
      <el-button @click="fetchCategories">重试</el-button>
    </div>

    <!-- empty -->
    <div v-else-if="!categories.length" class="state-box">
      <p class="state-text">还没有分类</p>
    </div>

    <!-- grid -->
    <div v-else class="category-grid">
      <button
        v-for="cat in categories"
        :key="cat.name"
        class="category-card"
        @click="goCategory(cat.name)"
      >
        <span class="category-dot" :style="{ backgroundColor: categoryColor(cat.name) }" />
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }} 篇</span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.categories-page {
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

.category-grid {
  max-width: 720px;
  margin: 0 auto;
  padding: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-md;
}

@media (max-width: $breakpoint-sm) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

.category-card {
  @include card-base;
  @include reveal;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    border-color: var(--color-primary-border);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);

    .category-name {
      color: var(--color-primary);
    }
  }
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-name {
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.category-count {
  margin-left: auto;
  font-size: $font-size-small;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

// ── 骨架屏 ──
.skeleton-grid {
  max-width: 720px;
  margin: 0 auto;
  padding: $spacing-md;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: $spacing-md;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.skeleton-card {
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  padding: $spacing-lg;
}

.skeleton-line {
  @include skeleton-line;
}
</style>
