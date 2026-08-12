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
import { useAuthStore } from '@/stores/modules/auth'
import MarkdownIt from 'markdown-it'
import HeroSection from '@/components/HeroSection.vue'
import { usePageMeta } from '@/utils/meta'
import EditorToolbar from './modules/EditorToolbar.vue'
import CoverUploader from './modules/CoverUploader.vue'
import TocEditor from './modules/TocEditor.vue'
import PreviewOverlay from './modules/PreviewOverlay.vue'

defineOptions({ name: 'WriteView' })

usePageMeta(() => (isEdit.value ? '编辑文章' : '写文章'))

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

// 预览覆盖层
const previewVisible = ref(false)

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

const handleSubmit = async (asDraft = false) => {
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
      status: (asDraft ? 'draft' : 'published') as 'draft' | 'published',
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

// ── 文本插入(工具栏 / 目录编辑器 / 图片上传共用) ──
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

// ── 工具栏 ──
/** 选区包裹: 有选中文字则包裹,否则插占位符 */
const wrapText = (prefix: string, suffix: string, placeholder: string) => {
  const textarea = editorRef.value?.textarea as HTMLTextAreaElement | undefined
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.slice(start, end)
  if (selected) {
    insertText(`${prefix}${selected}${suffix}`)
  } else {
    insertText(`${prefix}${placeholder}${suffix}`)
    // 选中占位符方便用户直接替换
    nextTick(() => {
      const pos = start + prefix.length
      textarea.focus()
      textarea.selectionStart = pos
      textarea.selectionEnd = pos + placeholder.length
    })
  }
}

const toolBold = () => wrapText('**', '**', '粗体')
const toolItalic = () => wrapText('*', '*', '斜体')
const toolStrikethrough = () => wrapText('~~', '~~', '删除线')
const toolCode = () => wrapText('`', '`', '代码')
const toolLink = () => wrapText('[', '](url)', '链接')
const toolQuote = () => {
  const textarea = editorRef.value?.textarea as HTMLTextAreaElement | undefined
  if (!textarea) return
  const start = textarea.selectionStart
  const lineStart = content.value.lastIndexOf('\n', start - 1) + 1
  const before = content.value.slice(0, lineStart)
  const after = content.value.slice(lineStart)
  content.value = `${before}> ${after}`
  nextTick(() => {
    textarea.focus()
    textarea.selectionStart = textarea.selectionEnd = start + 2
  })
}

const onToolCommand = (cmd: 'bold' | 'italic' | 'strike' | 'code' | 'link' | 'quote') => {
  const handlers = {
    bold: toolBold,
    italic: toolItalic,
    strike: toolStrikethrough,
    code: toolCode,
    link: toolLink,
    quote: toolQuote,
  }
  handlers[cmd]()
}

// ── 正文插图上传 ──
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

    <!-- Form: 编辑器 + 元数据侧栏 -->
    <form v-else class="write-form" @submit.prevent="handleSubmit()">
      <!-- 正文插图隐藏输入 -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />

      <el-row :gutter="24">
        <!-- 编辑器 -->
        <el-col :xs="24" :md="15">
          <div class="editor-pane">
            <EditorToolbar :uploading="uploading" @command="onToolCommand" @insert-image="triggerFilePicker" />

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
        </el-col>

        <!-- 元数据侧栏 -->
        <el-col :xs="24" :md="9">
          <div class="sidebar-card">
            <el-tabs default-value="info">
              <!-- 信息: 标题 / 封面 / 分类 -->
              <el-tab-pane label="信息" name="info">
                <div class="sidebar-field">
                  <label class="sidebar-label">标题</label>
                  <el-input
                    v-model="title"
                    placeholder="文章标题..."
                    size="large"
                    :disabled="saving"
                  />
                </div>

                <div class="sidebar-field">
                  <label class="sidebar-label">封面</label>
                  <CoverUploader v-model="coverImageUrl" />
                </div>

                <div class="sidebar-field">
                  <label class="sidebar-label">分类</label>
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
                    placeholder="输入新的或选已有"
                    :disabled="saving"
                    clearable
                  />
                </div>

                <span v-if="uploadError" class="toolbar-error">{{ uploadError }}</span>
                <p v-if="saveError" class="save-error">{{ saveError }}</p>
              </el-tab-pane>

              <!-- 目录: 标题管理 -->
              <el-tab-pane label="目录" name="toc">
                <TocEditor
                  :content="content"
                  @insert="insertText"
                  @update:content="content = $event"
                />
              </el-tab-pane>
            </el-tabs>

            <!-- 操作按钮: 始终可见 -->
            <div class="sidebar-actions">
              <el-button @click="previewVisible = true">预览</el-button>
              <el-button :loading="saving" native-type="submit" @click="handleSubmit(true)">
                {{ saving ? '保存中...' : '存草稿' }}
              </el-button>
              <el-button type="primary" :loading="saving" native-type="submit" @click="handleSubmit()">
                {{ saving ? '保存中...' : '发布' }}
              </el-button>
              <el-button @click="router.back()" :disabled="saving">取消</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </form>

    <!-- 预览覆盖层 -->
    <PreviewOverlay
      v-model="previewVisible"
      :title="title"
      :html="previewHtml"
      :cover-image="coverImageUrl"
      :category="category"
      :author-name="authStore.username"
    />
  </div>
</template>

<style lang="scss" scoped>
.write-page {
  max-width: 1100px;
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
  .el-row {
    max-width: 1100px;
    margin: 0 auto;
  }
}

.editor-pane {
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  padding: $spacing-lg;

  .editor-toolbar {
    margin: -$spacing-lg;
    margin-bottom: $spacing-md;
    padding: 0 $spacing-lg;
  }

  :deep(textarea) {
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    font-size: 16px;
    line-height: 1.8;
    min-height: 60vh;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-sm);
  padding: 2px $spacing-lg $spacing-lg;
  position: sticky;
  top: calc($header-height + $spacing-lg);
}

.sidebar-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.sidebar-label {
  font-size: $font-size-small;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.sidebar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  padding-top: $spacing-md;
  border-top: 1px solid var(--color-border-light);
}

.save-error {
  margin: 0;
  font-size: $font-size-small;
  color: var(--color-danger);
}

.toolbar-error {
  font-size: $font-size-small;
  color: var(--color-danger);
}

@media (max-width: $breakpoint-md) {
  .sidebar-card {
    position: static;
    margin-top: $spacing-sm;
  }

  .sidebar-actions {
    gap: 0;
  }
}
</style>
