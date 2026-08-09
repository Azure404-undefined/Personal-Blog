import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login, refreshToken } from '@/services/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || undefined)
  const refreshTokens = ref(localStorage.getItem('refresh_token') || undefined)
  const username = ref(localStorage.getItem('username') || undefined)
  const isLogin = computed(() => Boolean(token.value))
  const uid = computed(() => {
    if (!token.value) return null
    try {
      const parts = token.value.split('.')
      if (parts.length !== 3) return null
      const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return String(payload.sub) || null
    } catch {
      return null
    }
  })

  const setLocalToken = (newToken: string, refreshToken: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('refresh_token', refreshToken)
    token.value = newToken
    refreshTokens.value = refreshToken
  }

  const clearLocalToken = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    token.value = undefined
    refreshTokens.value = undefined
    username.value = undefined
  }

  /** 登录失效统一处理: 清 token + 提示 + 跳登录页 */
  const sessionExpired = (message: string) => {
    clearLocalToken()
    ElMessage({ message, type: 'error', duration: 3000, placement: 'top' })
    router.push('/login')
  }

  const userlogin = async (loginName: string, password: string) => {
    try {
      const response = await login({ username: loginName, password })
      setLocalToken(response.access_token, response.refresh_token)
      username.value = loginName
      localStorage.setItem('username', loginName)
    } catch (error) {
      clearLocalToken()
      ElMessage({
        message: '登录失败，请检查用户名和密码。',
        type: 'error',
        duration: 3000,
        placement: 'top',
      })
      throw error
    }
  }

  const refreshUserToken = async () => {
    if (!refreshTokens.value) {
      sessionExpired('登录失效，请重新登录。')
      throw new Error('No refresh token available')
    }
    try {
      const response = await refreshToken({ refresh_token: refreshTokens.value })
      setLocalToken(response.access_token, response.refresh_token)
    } catch (error) {
      sessionExpired('登录失效，请重新登录。')
      throw error
    }
  }

  return {
    token,
    isLogin,
    uid,
    username,
    refreshUserToken,
    setLocalToken,
    clearLocalToken,
    userlogin,
  }
})
