<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

defineOptions({ name: 'LoginView' })

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
  } catch {
    // store 已弹出 ElMessage.error,这里补表单内文案
    errorMsg.value = '登录失败,请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">登录</h1>
      <p class="login-sub">欢迎回到个人博客</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <el-input
          v-model="username"
          placeholder="用户名"
          size="large"
          :disabled="loading"
          clearable
        />
        <el-input
          v-model="password"
          type="password"
          placeholder="密码"
          size="large"
          :disabled="loading"
          show-password
        />

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

        <el-button type="primary" size="large" :loading="loading" native-type="submit">
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - $header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, rgba(64, 158, 255, 0.12) 0%, rgba(255, 255, 255, 1) 60%),
    url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=60') center / cover
      no-repeat;
}

.login-card {
  width: 380px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: $radius-lg;
  padding: 40px $spacing-xl;
  box-shadow: var(--shadow-lg);
}

.login-title {
  margin: 0 0 4px;
  font-size: $font-size-h1;
  font-weight: 700;
  color: var(--color-text-primary);
}

.login-sub {
  margin: 0 0 28px;
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-error {
  margin: -8px 0 0;
  font-size: $font-size-small;
  color: var(--color-danger);
}
</style>
