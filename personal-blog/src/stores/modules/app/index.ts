import { defineStore } from 'pinia'
import { useMediaQuery } from '@vueuse/core'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    // 监听屏幕宽度（768px 是移动端/PC 的常见分界线）
const isMobile = useMediaQuery('(max-width: 768px)')
// 控制移动端菜单的折叠状态
const isMenuOpen = ref(false)

// 切换菜单展开/收起
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

return {
  isMobile,
  isMenuOpen,
  toggleMenu,
  closeMenu,
}
})