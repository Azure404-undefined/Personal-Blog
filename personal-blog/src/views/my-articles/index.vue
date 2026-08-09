<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyArticles, deleteArticle } from '@/services/api/articles'
import { ElMessageBox, ElMessage } from 'element-plus'
import HeroSection from '@/components/HeroSection.vue'
import ArticleTimeline from '@/components/ArticleTimeline.vue'

defineOptions({ name: 'MyArticlesView' })

const router = useRouter()

const loading = ref(true)
const error = ref('')
const articles = ref<API.Articles.Article[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 10
const deleting = ref<string | null>(null)

const fetchArticles = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getMyArticles({ page: page.value, pageSize })
    articles.value = res.records
    total.value = res.total
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

const onPageChange = (p: number) => {
  page.value = p
  fetchArticles()
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  deleting.value = id
  try {
    await deleteArticle(id)
    articles.value = articles.value.filter((a) => a._id !== id)
    total.value--
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleting.value = null
  }
}

onMounted(fetchArticles)
</script>

<template>
  <div class="my-page">
    <HeroSection mini title="我的文章" />

    <!-- loading: 骨架屏 -->
    <div v-if="loading" class="skeleton-list">
      <div v-for="n in 4" :key="n" class="skeleton-row">
        <div class="skeleton-line" style="width:60%;animation-delay:0s" />
        <div class="skeleton-line" style="width:20%;animation-delay:0.1s;margin-left:auto" />
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
      <el-button type="primary" @click="router.push('/write')">写一篇</el-button>
    </div>

    <!-- list -->
    <template v-else>
      <ArticleTimeline :articles="articles" show-excerpt>
        <template #actions="{ article }">
          <el-button size="small" type="primary" @click="router.push(`/write?id=${article._id}`)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            :loading="deleting === article._id"
            @click="handleDelete(article._id)"
          >
            删除
          </el-button>
        </template>
      </ArticleTimeline>

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
.my-page {
  max-width: 800px;
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

.pagination-wrap {
  @include pagination-wrap;
}

// ── 骨架屏 ──
.skeleton-list {
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md 0;
  border-bottom: 1px solid var(--color-border-light);
}

.skeleton-line {
  @include skeleton-line(100%);
  margin-bottom: 0;
}
</style>
