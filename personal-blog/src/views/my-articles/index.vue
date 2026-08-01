<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyArticles, deleteArticle } from '@/services/api/articles'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

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

const fmtDate = (ts: number) => {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
    <h1 class="page-title">我的文章</h1>

    <!-- loading -->
    <div v-if="loading" class="state-box">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
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
      <el-button type="primary" @click="router.push('/write')">写一篇</el-button>
    </div>

    <!-- list -->
    <template v-else>
      <div class="article-list">
        <div v-for="item in articles" :key="item._id" class="article-row">
          <div class="row-main" @click="router.push(`/articles/${item._id}`)">
            <h3 class="row-title">{{ item.title }}</h3>
            <time class="row-date">{{ fmtDate(item.updatedAt) }}</time>
          </div>
          <div class="row-actions">
            <el-button size="small" @click="router.push(`/write?id=${item._id}`)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              :loading="deleting === item._id"
              @click="handleDelete(item._id)"
            >
              删除
            </el-button>
          </div>
        </div>
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
.my-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  @include page-title;
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
  display: flex;
  flex-direction: column;
  gap: 0;
}

.article-row {
  display: flex;
  align-items: center;
  padding: $spacing-md 0;
  border-bottom: 1px solid var(--color-border-light);
}

.row-main {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.row-title {
  margin: 0 0 $spacing-xs;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.row-date {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.row-actions {
  display: flex;
  gap: $spacing-sm;
  flex-shrink: 0;
  margin-left: $spacing-md;
}

.pagination-wrap {
  @include pagination-wrap;
}
</style>
