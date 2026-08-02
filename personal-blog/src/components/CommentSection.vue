<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getComments, createComment, deleteComment } from '@/services/api/comments'
import { useAuthStore } from '@/stores/modules/auth'
import { ElMessageBox, ElMessage } from 'element-plus'
import { fmtDate } from '@/utils/date'

const REPLIES_PREVIEW = 2

defineOptions({ name: 'CommentSection' })

const props = defineProps<{ articleId: string }>()

const router = useRouter()
const authStore = useAuthStore()

// ---- state ----
const comments = ref<API.Comments.Comment[]>([])
const loading = ref(true)
const error = ref('')

// 新建一级评论
const newComment = ref('')
const postingRoot = ref(false)

// 内联回复
const activeReplyRootId = ref<string | null>(null)
const activeReplyToAuthor = ref<string | null>(null)
const replyContent = ref('')
const submitting = ref(false)

// 二级回复折叠
const expandedThreads = ref<Set<string>>(new Set())

// ---- computed ----
const treeComments = computed<API.Comments.TreeComment[]>(() => {
  // !c.parentId 同时匹配 null 和 undefined（CloudBase 未设字段时返回 undefined）
  const roots = comments.value.filter((c) => !c.parentId)
  return roots.map((root) => ({
    ...root,
    replies: comments.value.filter((c) => c.parentId === root._id),
  }))
})

const commentCount = computed(() => comments.value.length)

// ---- methods ----
const fetchComments = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getComments(props.articleId)
    comments.value = res.records
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载评论失败'
  } finally {
    loading.value = false
  }
}

const isOwner = (comment: API.Comments.Comment) => comment.authorUid === authStore.uid

const visibleReplies = (root: API.Comments.TreeComment) => {
  return expandedThreads.value.has(root._id) ? root.replies : root.replies.slice(0, REPLIES_PREVIEW)
}

const toggleExpand = (rootId: string) => {
  const next = new Set(expandedThreads.value)
  if (next.has(rootId)) {
    next.delete(rootId)
  } else {
    next.add(rootId)
  }
  expandedThreads.value = next
}

const openReply = (rootId: string, replyToAuthor?: string | null) => {
  if (!authStore.isLogin) {
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
    return
  }
  if (activeReplyRootId.value === rootId && activeReplyToAuthor.value === (replyToAuthor ?? null)) {
    cancelReply()
    return
  }
  activeReplyRootId.value = rootId
  activeReplyToAuthor.value = replyToAuthor ?? null
  replyContent.value = ''
}

const cancelReply = () => {
  activeReplyRootId.value = null
  activeReplyToAuthor.value = null
  replyContent.value = ''
}

const handleSubmitReply = async (rootComment: API.Comments.TreeComment) => {
  if (!replyContent.value.trim()) return
  submitting.value = true
  try {
    await createComment(props.articleId, {
      content: replyContent.value.trim(),
      parentId: rootComment._id,
      author: authStore.username || '',
      replyToAuthor: activeReplyToAuthor.value,
    })
    cancelReply()
    await fetchComments()
    ElMessage({ message: '回复成功', type: 'success', duration: 2000 })
  } catch (e: unknown) {
    ElMessage({ message: e instanceof Error ? e.message : '回复失败', type: 'error', duration: 3000 })
  } finally {
    submitting.value = false
  }
}

const handlePostRoot = async () => {
  if (!newComment.value.trim()) return
  postingRoot.value = true
  try {
    await createComment(props.articleId, {
      content: newComment.value.trim(),
      parentId: null,
      author: authStore.username || '',
      replyToAuthor: null,
    })
    newComment.value = ''
    await fetchComments()
    ElMessage({ message: '评论成功', type: 'success', duration: 2000 })
  } catch (e: unknown) {
    ElMessage({ message: e instanceof Error ? e.message : '评论失败', type: 'error', duration: 3000 })
  } finally {
    postingRoot.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteComment(id)
    await fetchComments()
    ElMessage({ message: '已删除', type: 'success', duration: 2000 })
  } catch (e: unknown) {
    ElMessage({ message: e instanceof Error ? e.message : '删除失败', type: 'error', duration: 3000 })
  }
}

onMounted(fetchComments)
watch(
  () => props.articleId,
  () => {
    cancelReply()
    fetchComments()
  },
)
</script>

<template>
  <div class="comment-section">
    <h3 class="comment-title">评论 ({{ commentCount }})</h3>

    <!-- 加载 / 错误 / 空态 -->
    <div v-if="loading" class="comment-state">
      <div class="comment-spinner" />
      <span>加载中...</span>
    </div>
    <div v-else-if="error" class="comment-state comment-error">{{ error }}</div>
    <div v-else-if="!treeComments.length" class="comment-empty">暂无评论，来说点什么吧</div>

    <!-- 评论列表 -->
    <div v-else class="comment-section-body">
      <!-- 未登录提示 -->
      <div v-if="!authStore.isLogin" class="comment-login-hint">
        <span>登录后参与评论</span>
        <el-button
          size="small"
          type="primary"
          @click="
            router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
          "
        >
          去登录
        </el-button>
      </div>

      <!-- 一级评论输入框 -->
      <div v-if="authStore.isLogin" class="comment-post-root">
        <textarea
          v-model="newComment"
          class="comment-textarea"
          placeholder="写下你的评论..."
          rows="3"
        ></textarea>
        <div class="comment-post-actions">
          <el-button size="small" :loading="postingRoot" type="primary" @click="handlePostRoot">
            发布评论
          </el-button>
        </div>
      </div>
      <div v-for="root in treeComments" :key="root._id" class="comment-thread">
        <!-- 一级评论 (楼主) -->
        <div class="comment-item">
          <div class="comment-top">
            <span class="comment-author">{{ root.author }}</span>
          </div>
          <div class="comment-content" @click="openReply(root._id)">{{ root.content }}</div>
          <div class="comment-bottom">
            <div class="comment-left">
              <time class="comment-time">{{ fmtDate(root.createdAt, true) }}</time>
              <button
                v-if="authStore.isLogin"
                class="comment-btn comment-btn-reply"
                @click="openReply(root._id)"
              >
                回复
              </button>
              <button
                v-if="isOwner(root)"
                class="comment-btn comment-btn-delete"
                @click="handleDelete(root._id)"
              >
                删除
              </button>
            </div>
            <div class="comment-right">
              <!-- 预留：未来点赞 -->
            </div>
          </div>
        </div>

        <!-- 二级回复列表 -->
        <div v-if="root.replies.length" class="replies">
          <div v-for="reply in visibleReplies(root)" :key="reply._id" class="comment-item is-reply">
            <div class="comment-top">
              <span class="comment-author">{{ reply.author }}</span>
              <span v-if="reply.replyToAuthor" class="reply-label">
                回复 '{{ reply.replyToAuthor }}'
              </span>
            </div>
            <div class="comment-content" @click="openReply(root._id, reply.author)">
              {{ reply.content }}
            </div>
            <div class="comment-bottom">
              <div class="comment-left">
                <time class="comment-time">{{ fmtDate(reply.createdAt, true) }}</time>
                <button
                  v-if="authStore.isLogin"
                  class="comment-btn comment-btn-reply"
                  @click="openReply(root._id, reply.author)"
                >
                  回复
                </button>
                <button
                  v-if="isOwner(reply)"
                  class="comment-btn comment-btn-delete"
                  @click="handleDelete(reply._id)"
                >
                  删除
                </button>
              </div>
              <div class="comment-right">
                <!-- 预留：未来点赞 -->
              </div>
            </div>
          </div>
        </div>

        <!-- 展开/收起二级回复 -->
        <button
          v-if="root.replies.length > REPLIES_PREVIEW"
          class="replies-toggle"
          @click="toggleExpand(root._id)"
        >
          {{ expandedThreads.has(root._id) ? '收起' : `展开全部 ${root.replies.length} 条回复` }}
        </button>

        <!-- 内联回复输入框 -->
        <div v-if="activeReplyRootId === root._id" class="reply-box">
          <textarea
            v-model="replyContent"
            class="comment-textarea"
            :placeholder="`回复 ${activeReplyToAuthor || root.author}...`"
            rows="3"
          ></textarea>
          <div class="comment-post-actions">
            <el-button size="small" @click="cancelReply">取消</el-button>
            <el-button
              size="small"
              type="primary"
              :loading="submitting"
              @click="handleSubmitReply(root)"
            >
              提交
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-section {
  margin-top: $spacing-2xl;
  padding-top: $spacing-xl;
  border-top: 1px solid var(--color-border-light);
}

.comment-title {
  margin: 0 0 20px;
  font-size: $font-size-body;
  font-weight: 600;
  color: var(--color-text-primary);
}

.comment-state {
  padding: $spacing-xl 0;
  text-align: center;
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

.comment-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: skeleton-spin 0.8s linear infinite;
  margin: 0 auto 8px;
}

.comment-error {
  color: var(--color-danger);
}

.comment-empty {
  padding: $spacing-xl 0;
  text-align: center;
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
}

.comment-login-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  background: var(--color-bg-hover);
  border-radius: $radius-md;
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

// ---- 根评论输入 ----
.comment-post-root {
  margin-bottom: 20px;
}

.comment-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: $font-size-small;
  line-height: 1.6;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  resize: vertical;
  outline: none;
  font-family: inherit;
  color: var(--color-text-primary);
  box-sizing: border-box;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-placeholder);
  }
}

.comment-post-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

// ---- 评论列表 ----
.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-thread {
  @include reveal;

  & + & {
    margin-top: $spacing-md;
  }
}

// ---- 单条评论 ----
.comment-item {
  padding: 14px 0;

  & + & {
    border-top: 1px solid var(--color-border-light);
  }
}

.comment-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: $spacing-sm;
}

.comment-author {
  font-size: $font-size-small;
  font-weight: 600;
  color: var(--color-text-primary);
}

.reply-label {
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

.comment-content {
  font-size: $font-size-body;
  line-height: 1.7;
  color: var(--color-text-primary);
  word-break: break-word;
  margin-bottom: $spacing-sm;
  cursor: pointer;
  border-radius: $radius-sm;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-hover);
  }
}

.comment-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-time {
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
}

.comment-btn {
  padding: 0;
  font-size: $font-size-small;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: var(--color-primary);
  }
}

.comment-btn-delete:hover {
  color: var(--color-danger);
}

.comment-right {
  // 预留：未来点赞
}

// ---- 二级回复 ----
.replies {
  margin-left: 48px;
  padding-left: 12px;
  border-left: 3px solid var(--color-border-light);
  background: var(--color-bg-hover);
  border-radius: 0 $radius-md $radius-md 0;

  .comment-item {
    padding: 12px 12px 12px 0;

    &:first-child {
      padding-top: 10px;
    }
  }
}

// ---- 内联回复输入框 ----
.reply-box {
  margin-left: 48px;
  margin-top: $spacing-sm;
  margin-bottom: $spacing-sm;
}

// ---- 展开/收起 ----
.replies-toggle {
  display: block;
  margin-left: 48px;
  margin-top: $spacing-xs;
  padding: 0;
  font-size: $font-size-small;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--color-primary-hover);
  }
}

// ---- 响应式 ----
@media (max-width: $breakpoint-md) {
  .replies,
  .reply-box,
  .replies-toggle {
    margin-left: $spacing-lg;
  }
}
</style>
