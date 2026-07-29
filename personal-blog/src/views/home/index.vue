<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getArticles, getCategories } from '@/services/api/articles';

defineOptions({ name: 'HomeView' });

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref('');
const articles = ref<API.Articles.Article[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;
const category = ref('');
const categories = ref<string[]>([]);
const MAX_VISIBLE_TABS = 5;

const visibleCats = computed(() => categories.value.slice(0, MAX_VISIBLE_TABS));
const overflowCats = computed(() => categories.value.slice(MAX_VISIBLE_TABS));
const showOverflow = computed(() => overflowCats.value.length > 0);

const fetchArticles = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await getArticles({
      page: page.value,
      pageSize,
      category: category.value || undefined,
      q: (route.query.q as string) || undefined,
    } as API.Articles.getArticleParams);
    articles.value = res.records;
    total.value = res.total;
  } catch (e: any) {
    error.value = e?.message || '加载失败,请稍后重试';
  } finally {
    loading.value = false;
  }
};

const onCategoryChange = () => {
  page.value = 1;
  fetchArticles();
};

const onPageChange = (p: number) => {
  page.value = p;
  fetchArticles();
};

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const excerpt = (md: string, max = 120) => {
  const text = md.replace(/[#*>`[\]()!_~]/g, '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max) + '...' : text;
};

onMounted(() => {
  fetchArticles();
  getCategories().then((list) => { categories.value = list; }).catch(() => {});
});

// 监听搜索关键词变化(同一路由导航时 onMounted 不触发)
watch(() => route.query.q, () => {
  page.value = 1;
  fetchArticles();
});
</script>

<template>
  <div class="home-page">
    <!-- 分类筛选 -->
    <div v-if="categories.length" class="filter-bar">
      <button
        :class="['cat-tag', { 'cat-tag--active': !category }]"
        @click="category = ''; onCategoryChange()"
      >全部</button>
      <button
        v-for="cat in visibleCats"
        :key="cat"
        :class="['cat-tag', { 'cat-tag--active': category === cat }]"
        @click="category = cat; onCategoryChange()"
      >{{ cat }}</button>
      <el-select
        v-if="showOverflow"
        :model-value="overflowCats.includes(category) ? category : ''"
        placeholder="更多"
        size="small"
        class="cat-overflow"
        @change="(val: string) => { category = val; onCategoryChange(); }"
      >
        <el-option
          v-for="cat in overflowCats"
          :key="cat"
          :label="cat"
          :value="cat"
        />
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
          <h2 class="card-title">{{ item.title }}</h2>
          <p class="card-excerpt">{{ excerpt(item.content) }}</p>
          <time class="card-date">{{ fmtDate(item.createdAt) }}</time>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  }
}

.card-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-excerpt {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
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
