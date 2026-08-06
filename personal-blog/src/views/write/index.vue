<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getArticleById,
  createArticle,
  updateArticle,
  getCategories,
} from '@/services/api/articles'
import { uploadImage } from '@/services/api/upload'
import { ElMessage } from 'element-plus'
import { Picture, PictureFilled, Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/modules/auth'
import MarkdownIt from 'markdown-it'
import SafeContent from '@/components/safeContent.vue'
import HeroSection from '@/components/HeroSection.vue'

defineOptions({ name: 'WriteView' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const md = new MarkdownIt({ breaks: true, linkify: true })

const isEdit = computed(() => !!route.query.id)
const editId = computed(() => route.query.id as string)

const title = ref('')
const content = ref('')
const category = ref('')
const categories = ref<string[]>([])
const saving = ref(false)
const loadingArticle = ref(false)
const fetchError = ref('')
const saveError = ref('')
const uploading = ref(false)
const uploadError = ref('')

const coverImageUrl = ref('')
const coverUploading = ref(false)
const coverError = ref('')
const coverInputRef = ref<HTMLInputElement | null>(null)

const editorRef = ref<{ textarea?: HTMLTextAreaElement } | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const previewHtml = computed(() => (content.value ? md.render(content.value) : ''))

const fetchArticle = async () => {
  loadingArticle.value = true
  fetchError.value = ''
  try {
    const article = await getArticleById(editId.value)
    if (article.ownerUid !== authStore.uid) {
      fetchError.value = '无权编辑他人的文章'
      return
    }
    title.value = article.title
    content.value = article.content
    category.value = article.category || ''
    coverImageUrl.value = article.coverImage || ''
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : '加载文章失败'
  } finally {
    loadingArticle.value = false
  }
}

// 路由切换(编辑↔创建)时重置状态
watch(
  () => route.query.id,
  () => {
    title.value = ''
    content.value = ''
    category.value = ''
    coverImageUrl.value = ''
    coverError.value = ''
    fetchError.value = ''
    if (isEdit.value) fetchArticle()
  },
)

onMounted(() => {
  getCategories()
    .then((list) => {
      categories.value = list
    })
    .catch(() => {})
  if (isEdit.value) fetchArticle()
})

const handleSubmit = async () => {
  const t = title.value.trim()
  const c = content.value.trim()
  if (!t || !c) {
    saveError.value = '标题和内容不能为空'
    return
  }
  saving.value = true
  saveError.value = ''
  try {
    let id: string
    const payload = {
      title: t,
      content: c,
      category: category.value || undefined,
      coverImage: coverImageUrl.value || undefined,
      authorName: authStore.username || '',
    }
    if (isEdit.value) {
      await updateArticle(editId.value, payload)
      id = editId.value
    } else {
      const res = await createArticle(payload)
      id = res.id
    }
    router.push(`/articles/${id}`)
  } catch (e: unknown) {
    saveError.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
  }
}

const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const uploadAndInsert = async (file: File) => {
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '图片不能超过 5MB'
    ElMessage.error('图片不能超过 5MB')
    return
  }
  uploadError.value = ''
  uploading.value = true
  try {
    const res = await uploadImage(file)
    const escaped = file.name.replace(/]/g, '\\]')
    const md = `![${escaped}](${res.url})`
    insertText(md)
    ElMessage.success('图片已插入')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '上传失败'
    uploadError.value = msg
    ElMessage.error(msg)
  } finally {
    uploading.value = false
  }
}

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await uploadAndInsert(file)
  ;(e.target as HTMLInputElement).value = ''
}

const insertText = (text: string) => {
  const textarea = editorRef.value?.textarea as HTMLTextAreaElement | undefined
  if (!textarea) {
    content.value += `\n${text}`
    return
  }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  content.value = content.value.slice(0, start) + text + content.value.slice(end)
  nextTick(() => {
    textarea.focus()
    textarea.selectionStart = textarea.selectionEnd = start + text.length
  })
}

const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) uploadAndInsert(file)
      return
    }
  }
}

const triggerCoverPicker = () => {
  coverInputRef.value?.click()
}

const handleCoverChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    coverError.value = '封面图片不能超过 5MB'
    ElMessage.error('封面图片不能超过 5MB')
    return
  }
  coverUploading.value = true
  coverError.value = ''
  try {
    const res = await uploadImage(file)
    coverImageUrl.value = res.url
    ElMessage.success('封面上传成功')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '封面上传失败'
    coverError.value = msg
    ElMessage.error(msg)
  } finally {
    coverUploading.value = false
  }
  ;(e.target as HTMLInputElement).value = ''
}

const removeCover = () => {
  coverImageUrl.value = ''
}
</script>

<template>
  <div class="write-page">
    <HeroSection mini :title="isEdit ? '编辑文章' : '写文章'" />

    <!-- 编辑文章加载 -->
    <div v-if="loadingArticle" class="state-loading">
      <span>加载中...</span>
    </div>

    <div v-else-if="fetchError" class="state-box">
      <p class="state-text error-text">{{ fetchError }}</p>
      <el-button @click="router.push('/')">返回首页</el-button>
    </div>

    <!-- Form -->
    <form v-else class="write-form" @submit.prevent="handleSubmit">
      <el-input v-model="title" placeholder="文章标题" size="large" :disabled="saving" />

      <!-- Cover image uploader -->
      <div class="cover-uploader">
        <input
          ref="coverInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleCoverChange"
        />
        <div v-if="!coverImageUrl" class="cover-placeholder" @click="triggerCoverPicker">
          <span class="placeholder-icon"><el-icon :size="28"><PictureFilled /></el-icon></span>
          <span>{{ coverUploading ? '上传中...' : '点击上传封面图片' }}</span>
          <span class="placeholder-hint">支持 JPG / PNG / WebP，最大 5MB</span>
        </div>
        <div v-else class="cover-preview" @click="triggerCoverPicker">
          <img :src="coverImageUrl" alt="封面预览" />
          <div class="cover-preview-overlay">
            <el-button size="small" circle type="danger" @click.stop="removeCover">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <span v-if="coverError" class="cover-error">{{ coverError }}</span>
      </div>

      <el-autocomplete
        v-model="category"
        :fetch-suggestions="
          (q: string, cb: any) =>
            cb(
              q
                ? categories.filter((c) => c.includes(q)).map((c) => ({ value: c }))
                : categories.map((c) => ({ value: c })),
            )
        "
        placeholder="分类(可选,输入新的或选已有)"
        :disabled="saving"
        clearable
      />

      <div class="editor-toolbar">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        />
        <el-button size="small" :disabled="uploading" @click="triggerFilePicker">
          <el-icon v-if="!uploading"><Picture /></el-icon>
          {{ uploading ? '上传中...' : '插入图片' }}
        </el-button>
        <span v-if="uploadError" class="toolbar-error">{{ uploadError }}</span>
      </div>

      <div class="editor-area">
        <div class="editor-pane">
          <el-input
            ref="editorRef"
            v-model="content"
            type="textarea"
            placeholder="Markdown 正文..."
            :rows="18"
            :disabled="saving"
            resize="vertical"
            @paste="handlePaste"
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
  padding: 0 $spacing-md;
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

.write-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.cover-uploader {
  margin-bottom: $spacing-xs;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 140px;
  border: 2px dashed var(--color-border);
  border-radius: $radius-md;
  cursor: pointer;
  color: var(--color-text-muted);
  background: linear-gradient(to bottom, var(--color-bg-page), var(--color-bg-card));
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
  font-size: 13px;

  .placeholder-icon {
    font-size: 28px;
    color: var(--color-primary);
    margin-bottom: 2px;
  }

  .placeholder-hint {
    font-size: 11px;
    color: var(--color-text-placeholder);
  }

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: linear-gradient(to bottom, var(--color-primary-bg), var(--color-bg-card));
  }
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  img {
    @include cover-img;
  }
  &-overlay {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    opacity: 0;
    transition: opacity 0.2s;
  }
  &:hover &-overlay {
    opacity: 1;
  }
}

.cover-error {
  display: inline-block;
  margin-top: $spacing-xs;
  font-size: $font-size-small;
  color: var(--color-danger);
}

.editor-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
  min-height: 400px;
}

.editor-pane {
  :deep(textarea) {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 15px;
    line-height: 1.8;
  }
}

.preview-pane {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  padding: $spacing-md;
  overflow-y: auto;
  box-shadow: var(--shadow-sm);
}

.preview-label {
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-hint {
  margin: 0;
  color: var(--color-text-placeholder);
  font-size: $font-size-small;
}

.save-error {
  margin: 0;
  font-size: $font-size-small;
  color: var(--color-danger);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.toolbar-error {
  font-size: $font-size-small;
  color: var(--color-danger);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding-top: $spacing-md;
  border-top: 1px solid var(--color-border-light);
}
</style>
