import { defineStore } from 'pinia'
import { useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 监听屏幕宽度（768px 是移动端/PC 的常见分界线）
  const isMobile = useMediaQuery('(max-width: 768px)')
  // 控制移动端菜单的折叠状态
  const isMenuOpen = ref(false)
  // 控制头部的显示状态
  const setHeaderVisible = ref(true)

  // ── 主题（暗色模式预留） ──
  type Theme = 'light' | 'dark'
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light')

  const setTheme = (t: Theme) => {
    theme.value = t
    localStorage.setItem('theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // 初始化：同步 DOM 属性
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // 切换菜单展开/收起
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  // 设置头部的显示状态
  const setHeaderVisibility = (visible: boolean) => {
    setHeaderVisible.value = visible
  }

  const closeMenu = () => {
    isMenuOpen.value = false
  }

  // ── 搜索弹窗 ──
  const showSearchModal = ref(false)

  const openSearchModal = () => {
    showSearchModal.value = true
  }
  const closeSearchModal = () => {
    showSearchModal.value = false
  }

  // ── 登录弹窗 ──
  const showLoginModal = ref(false)

  const openLoginModal = () => {
    showLoginModal.value = true
  }
  const closeLoginModal = () => {
    showLoginModal.value = false
  }

  return {
    isMobile,
    isMenuOpen,
    setHeaderVisible,
    setHeaderVisibility,
    toggleMenu,
    closeMenu,
    // 主题
    theme,
    setTheme,
    toggleTheme,
    // 搜索弹窗
    showSearchModal,
    openSearchModal,
    closeSearchModal,
    // 登录弹窗
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  }
})
