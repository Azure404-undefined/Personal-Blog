<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleById, createArticle, updateArticle, getCategories } from '@/services/api/articles';
import { useAuthStore } from '@/stores/modules/auth';
import MarkdownIt from 'markdown-it';
import SafeContent from '@/components/safeContent.vue';

defineOptions({ name: 'WriteView' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const md = new MarkdownIt({ breaks: true, linkify: true });

const isEdit = computed(() => !!route.query.id);
const editId = computed(() => route.query.id as string);

const title = ref('');
const content = ref('');
const category = ref('');
const categories = ref<string[]>([]);
const saving = ref(false);
const loadingArticle = ref(false);
const fetchError = ref('');
const saveError = ref('');

const previewHtml = computed(() => (content.value ? md.render(content.value) : ''));

const fetchArticle = async () => {
  loadingArticle.value = true;
  fetchError.value = '';
  try {
    const article = await getArticleById(editId.value);
    if (article.ownerUid !== authStore.uid) {
      fetchError.value = '无权编辑他人的文章';
      return;
    }
    title.value = article.title;
    content.value = article.content;
    category.value = article.category || '';
  } catch (e: any) {
    fetchError.value = e?.message || '加载文章失败';
  } finally {
    loadingArticle.value = false;
  }
};

// 路由切换(编辑↔创建)时重置状态
watch(
  () => route.query.id,
  () => {
    title.value = '';
    content.value = '';
    category.value = '';
    fetchError.value = '';
    if (isEdit.value) fetchArticle();
  }
);

onMounted(() => {
  getCategories().then((list) => { categories.value = list; }).catch(() => {});
  if (isEdit.value) fetchArticle();
});

const handleSubmit = async () => {
  const t = title.value.trim();
  const c = content.value.trim();
  if (!t || !c) {
    saveError.value = '标题和内容不能为空';
    return;
  }
  saving.value = true;
  saveError.value = '';
  try {
    let id: string;
    const payload = { title: t, content: c, category: category.value || null };
    if (isEdit.value) {
      await updateArticle(editId.value, payload);
      id = editId.value;
    } else {
      const res = await createArticle(payload);
      id = res.id;
    }
    router.push(`/articles/${id}`);
  } catch (e: any) {
    saveError.value = e?.message || '保存失败';
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="write-page">
    <h1 class="page-title">{{ isEdit ? '编辑文章' : '写文章' }}</h1>

    <!-- Loading / Error for edit fetch -->
    <div v-if="loadingArticle" class="state-box">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="fetchError" class="state-box">
      <p class="state-text error-text">{{ fetchError }}</p>
      <el-button @click="router.push('/')">返回首页</el-button>
    </div>

    <!-- Form -->
    <form v-else class="write-form" @submit.prevent="handleSubmit">
      <el-input
        v-model="title"
        placeholder="文章标题"
        size="large"
        :disabled="saving"
      />

      <el-autocomplete
        v-model="category"
        :fetch-suggestions="(q: string, cb: any) => cb(q ? categories.filter(c => c.includes(q)).map(c => ({value:c})) : categories.map(c => ({value:c})))"
        placeholder="分类(可选,输入新的或选已有)"
        :disabled="saving"
        clearable
      />

      <div class="editor-area">
        <div class="editor-pane">
          <el-input
            v-model="content"
            type="textarea"
            placeholder="Markdown 正文..."
            :rows="18"
            :disabled="saving"
            resize="vertical"
          />
        </div>
        <div class="preview-pane">
          <div class="preview-label">预览</div>
          <SafeContent v-if="previewHtml" :html="previewHtml" />
          <p v-else class="preview-hint">输入内容后自动预览</p>
        </div>
      </div>

      <p v-if="saveError" class="save-error">{{ saveError }}</p>

      <div class="form-actions">
        <el-button @click="router.back()" :disabled="saving">取消</el-button>
        <el-button type="primary" :loading="saving" native-type="submit">
          {{ saving ? '保存中...' : '发布' }}
        </el-button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.write-page {
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 600;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: #909399;
}
.state-text {
  margin: 0;
  font-size: 14px;
}
.error-text {
  color: #f56c6c;
}

.write-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  min-height: 400px;
}

.editor-pane {
  :deep(textarea) {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 14px;
    line-height: 1.7;
  }
}

.preview-pane {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.preview-label {
  font-size: 12px;
  color: #c0c4cc;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-hint {
  margin: 0;
  color: #c0c4cc;
  font-size: 14px;
}

.save-error {
  margin: 0;
  font-size: 13px;
  color: #f56c6c;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
