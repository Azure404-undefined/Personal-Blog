<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleById, deleteArticle } from '@/services/api/articles';
import { useAuthStore } from '@/stores/modules/auth';
import MarkdownIt from 'markdown-it';
import SafeContent from '@/components/safeContent.vue';
import CommentSection from '@/components/CommentSection.vue';
import { ElMessageBox } from 'element-plus';

defineOptions({ name: 'ArticleDetailView' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const md = new MarkdownIt({ breaks: true, linkify: true });

const loading = ref(true);
const error = ref('');
const article = ref<API.Articles.Article | null>(null);
const deleting = ref(false);

const id = computed(() => route.params.id as string);
const isOwner = computed(() => article.value?.ownerUid === authStore.uid);
const html = computed(() => (article.value ? md.render(article.value.content) : ''));

const fetchArticle = async () => {
  loading.value = true;
  error.value = '';
  try {
    article.value = await getArticleById(id.value);
  } catch (e: any) {
    if (e?.response?.status === 404) {
      error.value = '文章不存在';
    } else {
      error.value = e?.message || '加载失败';
    }
  } finally {
    loading.value = false;
  }
};

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return; // 用户取消
  }
  deleting.value = true;
  try {
    await deleteArticle(id.value);
    router.push('/');
  } catch (e: any) {
    error.value = e?.message || '删除失败';
  } finally {
    deleting.value = false;
  }
};

onMounted(fetchArticle);
watch(() => route.params.id, fetchArticle);
</script>

<template>
  <div class="detail-page">
    <!-- loading -->
    <div v-if="loading" class="state-box">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- error -->
    <div v-else-if="error" class="state-box">
      <p class="state-text error-text">{{ error }}</p>
      <el-button @click="fetchArticle">重试</el-button>
    </div>

    <!-- content -->
    <template v-else-if="article">
      <header class="detail-header">
        <h1 class="detail-title">{{ article.title }}</h1>
        <div class="detail-meta">
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

      <div class="detail-body">
        <SafeContent :html="html" />
      </div>

      <CommentSection :article-id="id" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  max-width: 780px;
  margin: 0 auto;
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

.detail-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
}

.detail-meta {
  font-size: 13px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-body {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  word-break: break-word;
}
</style>
