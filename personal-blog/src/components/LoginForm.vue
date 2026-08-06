<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

defineOptions({ name: 'LoginForm' })

const props = withDefaults(defineProps<{ align?: 'left' | 'center' }>(), { align: 'center' })

const emit = defineEmits<{
  (e: 'success'): void
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.userlogin(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
    emit('success')
  } catch {
    errorMsg.value = '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleLogin">
    <h2 class="login-form-title">登录</h2>
    <p class="login-form-sub">欢迎回到个人博客</p>

    <input
      v-model="username"
      class="login-input"
      type="text"
      placeholder="用户名"
      :disabled="loading"
      autocomplete="username"
    />
    <input
      v-model="password"
      class="login-input"
      type="password"
      placeholder="密码"
      :disabled="loading"
      autocomplete="current-password"
    />

    <p v-if="errorMsg" class="login-form-error">{{ errorMsg }}</p>

    <button class="login-submit" type="submit" :disabled="loading">
      <span>{{ loading ? '登录中...' : '登录' }}</span>
    </button>
  </form>
</template>

<style lang="scss" scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-form-title {
  margin: 0;
  font-size: $font-size-h1;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: v-bind('props.align');
}

.login-form-sub {
  margin: -6px 0 8px;
  font-size: $font-size-small;
  color: var(--color-text-muted);
  text-align: v-bind('props.align');
}

.login-input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  font-size: $font-size-body;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:focus {
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.login-form-error {
  margin: -4px 0 0;
  font-size: $font-size-small;
  color: var(--color-danger);
}

.login-submit {
  position: relative;
  width: 100%;
  height: 44px;
  margin-top: 6px;
  border: none;
  border-radius: $radius-md;
  font-size: $font-size-body;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-primary), #00bcd4);
  transition: box-shadow 0.3s ease, transform 0.6s ease;

  span {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(135deg, #00bcd4, var(--color-primary));
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    z-index: 0;
  }

  &:hover:not(:disabled)::before{
    opacity: 1;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 4px 20px rgba(0, 188, 212, 0.35);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
