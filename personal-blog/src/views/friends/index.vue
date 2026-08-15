<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getFriends, createFriend, deleteFriend } from '@/services/api/friends'
import { useAuthStore } from '@/stores/modules/auth'
import { avatarInitial } from '@/utils/avatar'
import HeroSection from '@/components/HeroSection.vue'
import { usePageMeta } from '@/utils/meta'
import friendsImg from '@/assets/imgs/friends.png'
import { ElMessageBox, ElMessage } from 'element-plus'

defineOptions({ name: 'FriendsView' })

usePageMeta('朋友们', 'Azure 的友情链接')

const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const friends = ref<API.Friends.Friend[]>([])

// 跟踪头像加载失败的友链 ID
const imgFailed = reactive(new Set<string>())

// 添加表单
const showForm = ref(false)
const saving = ref(false)
const form = ref<API.Friends.CreateFriendParams>({
  name: '',
  url: '',
  avatar: '',
  description: '',
})

const isOwner = (friend: API.Friends.Friend) => friend.ownerUid === authStore.uid

const fetchFriends = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getFriends()
    friends.value = res.records
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败,请稍后重试'
  } finally {
    loading.value = false
  }
}

// 补全 URL 协议 + 基础校验
const normalizeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ''
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  // 必须有协议后的实际域名(拒绝 "https://" 这种空的)
  if (!/^https?:\/\/[^/]+/i.test(withProtocol)) return ''
  return withProtocol
}

const openLink = (friend: API.Friends.Friend) => {
  window.open(normalizeUrl(friend.url), '_blank', 'noopener')
}

const openForm = () => {
  form.value = { name: '', url: '', avatar: '', description: '' }
  showForm.value = true
}

const handleCreate = async () => {
  if (!form.value.name.trim() || !form.value.url.trim()) {
    ElMessage.warning('名称和网址必填')
    return
  }
  const normalized = normalizeUrl(form.value.url)
  if (!normalized) {
    ElMessage.warning('网址格式不正确')
    return
  }
  saving.value = true
  try {
    await createFriend({
      ...form.value,
      url: normalized,
    })
    ElMessage.success('添加成功')
    showForm.value = false
    fetchFriends()
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '添加失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (friend: API.Friends.Friend) => {
  try {
    await ElMessageBox.confirm(`确定要删除「${friend.name}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  try {
    await deleteFriend(friend._id)
    ElMessage.success('已删除')
    friends.value = friends.value.filter((f) => f._id !== friend._id)
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

onMounted(fetchFriends)
</script>

<template>
  <div class="friends-page">
    <HeroSection mini :cover-image="friendsImg" title="朋友们" />

    <div class="friends-body">
      <!-- 登录后: 添加按钮 -->
      <div v-if="authStore.isLogin" class="admin-bar">
        <el-button v-if="!showForm" type="primary" plain @click="openForm">
          + 添加友链
        </el-button>
      </div>

      <!-- 添加表单 -->
      <div v-if="showForm" class="friend-form">
        <el-form label-width="72px" @submit.prevent="handleCreate">
          <el-form-item label="名称" required>
            <el-input v-model="form.name" placeholder="站点名称" maxlength="50" />
          </el-form-item>
          <el-form-item label="网址" required>
            <el-input v-model="form.url" placeholder="https://example.com" />
          </el-form-item>
          <el-form-item label="头像">
            <el-input v-model="form.avatar" placeholder="头像图片 URL(可选)" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="form.description"
              placeholder="一句话介绍(可选)"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleCreate">保存</el-button>
            <el-button @click="showForm = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- loading -->
      <div v-if="loading" class="state-loading" />

      <!-- error -->
      <div v-else-if="error" class="state-box">
        <p class="state-text error-text">{{ error }}</p>
        <el-button @click="fetchFriends">重试</el-button>
      </div>

      <!-- empty -->
      <div v-else-if="!friends.length" class="state-box">
        <p class="state-text">还没有友链</p>
      </div>

      <!-- grid -->
      <div v-else class="friend-grid">
        <div
          v-for="friend in friends"
          :key="friend._id"
          class="friend-card"
          @click="openLink(friend)"
        >
          <div class="friend-avatar-wrap">
            <img
              v-if="friend.avatar && !imgFailed.has(friend._id)"
              :src="friend.avatar"
              :alt="friend.name"
              class="friend-avatar"
              loading="lazy"
              @error="imgFailed.add(friend._id)"
            />
            <span
              v-else
              class="friend-avatar friend-avatar--fallback"
            >
              {{ avatarInitial(friend.name) }}
            </span>
          </div>
          <div class="friend-info">
            <h3 class="friend-name">{{ friend.name }}</h3>
            <p v-if="friend.description" class="friend-desc">{{ friend.description }}</p>
            <p v-else class="friend-desc friend-desc--placeholder">友情链接</p>
          </div>
          <button
            v-if="isOwner(friend)"
            class="friend-delete"
            :aria-label="`删除 ${friend.name}`"
            @click.stop="handleDelete(friend)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.friends-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.state-loading {
  @include state-spinner;
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

.friends-body {
  max-width: 720px;
  margin: 0 auto;
  padding: $spacing-md;
}

.admin-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: $spacing-md;
}

.friend-form {
  @include card-base;
  margin-bottom: $spacing-lg;
  padding: $spacing-lg;
}

.friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: $spacing-md;
}

@media (max-width: $breakpoint-sm) {
  .friend-grid {
    grid-template-columns: 1fr;
  }
}

.friend-card {
  @include card-base;
  @include reveal;
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    border-color: var(--color-primary-border);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);

    .friend-name {
      color: var(--color-primary);
    }
  }
}

.friend-avatar-wrap {
  flex-shrink: 0;
}

.friend-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;

  &--fallback {
    background: var(--color-primary);
    color: #fff;
    font-size: $font-size-h2;
    font-weight: 600;
    user-select: none;
  }
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  margin: 0 0 4px;
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.friend-desc {
  margin: 0;
  font-size: $font-size-small;
  color: var(--color-text-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--placeholder {
    color: var(--color-text-muted);
  }
}

.friend-delete {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: var(--color-bg-hover);
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 0.2s,
    background 0.2s,
    color 0.2s;

  &:hover {
    background: var(--color-danger);
    color: #fff;
  }
}

.friend-card:hover .friend-delete {
  opacity: 1;
}
</style>
