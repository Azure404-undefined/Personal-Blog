<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useScroll } from '@vueuse/core'
import { useAppStore } from '@/stores/modules/app'
import AppHeader from './modules/AppHeader.vue'
import AppFooter from './modules/AppFooter.vue'

const appStore = useAppStore()

// 弹窗懒加载:首次需要时才挂载(latch 后常驻,保留退出过渡与内部 watch 语义)
const loginMounted = ref(false)
const searchMounted = ref(false)
const topMounted = ref(false)

watch(
  () => appStore.showLoginModal,
  (v) => {
    if (v && !loginMounted.value) loginMounted.value = true
  },
)
watch(
  () => appStore.showSearchModal,
  (v) => {
    if (v && !searchMounted.value) searchMounted.value = true
  },
)

// BackToTop 无 store flag,滚过一屏即挂载
const { y } = useScroll(window)
watch(
  y,
  (v) => {
    if (v > window.innerHeight && !topMounted.value) topMounted.value = true
  },
  { immediate: true },
)

// ⌘K 全局监听放常驻组件(SearchModal 首开前不存在)
const onGlobalKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    appStore.openSearchModal()
  }
}
onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))

const LoginModal = defineAsyncComponent(() => import('./modules/LoginModal.vue'))
const SearchModal = defineAsyncComponent(() => import('./modules/SearchModal.vue'))
const BackToTop = defineAsyncComponent(() => import('./modules/BackToTop.vue'))
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-main">
      <slot />
    </main>

    <AppFooter />

    <LoginModal v-if="loginMounted" />
    <SearchModal v-if="searchMounted" />
    <BackToTop v-if="topMounted" />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  max-width: $max-width-content;
  width: 100%;
  margin: 0 auto;
  margin-top: $header-height;
  padding: 0;
}
</style>
