import { defineStore } from 'pinia'
import { useMediaQuery, useDark, useToggle } from '@vueuse/core'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 监听屏幕宽度（768px 是移动端/PC 的常见分界线）
  const isMobile = useMediaQuery('(max-width: 768px)')
  // 控制移动端菜单的折叠状态
  const isMenuOpen = ref(false)
  // 控制头部的显示状态
  const setHeaderVisible = ref(true)

  // ── 主题 ──
  const isDark = useDark({
    selector: 'html',
    attribute: 'data-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme',
    disableTransition: false,
  })
  const toggleTheme = useToggle(isDark)
  const theme = computed<'light' | 'dark'>(() => (isDark.value ? 'dark' : 'light'))

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
    isDark,
    theme,
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
