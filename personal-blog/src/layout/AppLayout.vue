<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { useAppStore } from '@/stores/modules/app'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useScroll } from '@vueuse/core'

const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// const mainRef = useTemplateRef('mainRef');
const { y, directions } = useScroll(window, { throttle: 100 });
const searchQuery = ref('')
const handleSearch = () => {
  const q = searchQuery.value.trim()
  if (q) {
    router.push({ path: '/', query: { q } })
  } else {
    router.push('/')
  }
}

const handleLogout = () => {
  authStore.clearLocalToken()
  appStore.closeMenu()
  router.push('/')
}

watch(
  y,
  () => {
    if (y.value > 52 && directions.bottom){
      appStore.setHeaderVisibility(false)
    } else if (directions.top) {
      appStore.setHeaderVisibility(true)
    }
  }
)
</script>

<template>
  <div class="app-layout">
    <header class="app-header" :class="{ hidden: !appStore.setHeaderVisible, background: y < 52 }">
      <div class="header-inner">
        <router-link to="/" class="logo" @click="appStore.closeMenu()"> 📝 个人博客 </router-link>

        <!-- 导航链接 -->
        <nav class="nav-links" :class="{ 'nav-links--open': appStore.isMenuOpen }">
          <router-link to="/" :class="{ active: route.path === '/' }" @click="appStore.closeMenu()"
            >首页</router-link
          >
          <router-link
            to="/my-articles"
            :class="{ active: route.path === '/my-articles' }"
            @click="appStore.closeMenu()"
            >我的文章</router-link
          >
          <router-link
            to="/write"
            :class="{ active: route.path === '/write' }"
            @click="appStore.closeMenu()"
            >写文章</router-link
          >
        </nav>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章..."
            size="small"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="user-area">
          <template v-if="authStore.isLogin">
            <span class="uid">{{ authStore.username }}</span>
            <el-button text size="small" @click="handleLogout">登出</el-button>
          </template>
          <el-button v-else size="small" type="primary" @click="router.push('/login')">
            登录
          </el-button>

          <!-- 汉堡按钮(移动端显示) -->
          <button
            class="hamburger"
            :class="{ 'hamburger--open': appStore.isMenuOpen }"
            :aria-label="appStore.isMenuOpen ? '关闭菜单' : '打开菜单'"
            @click="appStore.toggleMenu()"
          >
            <span class="hamburger-line" />
            <span class="hamburger-line" />
            <span class="hamburger-line" />
          </button>
        </div>
      </div>
    </header>

    <!-- 内容槽 —— App.vue 传入 <router-view /> -->
    <main class="app-main" ref="mainRef" >
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
// token 来自 @/styles/tokens.scss (SCSS 变量) + variables.css (CSS 变量)

// ── layout ──
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  border-bottom: 1px solid var(--color-border);
  background: rgba(29, 30, 31, 0.3);
  padding: 0;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  transition: transform 0.5s ease;

  .header-inner {
    max-width: $max-width-content;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: $header-height;
    gap: $spacing-lg;
  }

  &.hidden {
    transform: translateY(-100%);
  }

  &.background {
    background: transparent;
  }
}

// ── logo ──
.logo {
  font-size: $font-size-body;
  font-weight: 600;
  color: var(--color-text-primary);
  text-decoration: none;
  flex-shrink: 0;
}

// ── 导航链接 ──
.nav-links {
  display: flex;
  gap: $spacing-xs;

  a {
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: $font-size-small;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    transition:
      color 0.2s,
      background 0.2s;

    &:hover {
      color: var(--color-primary);
      background: var(--color-primary-bg);
    }

    &.active {
      color: var(--color-primary);
    }
  }
}

// ── 搜索框 ──
.search-box {
  width: 200px;
}

// ── 用户区 ──
.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.uid {
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

// ── 汉堡按钮 ──
.hamburger {
  $size: 36px;

  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $spacing-xs;
  width: $size;
  height: $size;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: $radius-sm;

  &-line {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--color-text-primary);
    border-radius: 1px;
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  // 三横 → X 动画
  &--open &-line {
    &:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }
    &:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }
    &:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }
  }
}

// ── 内容区 ──
.app-main {
  flex: 1;
  max-width: $max-width-content;
  width: 100%;
  margin: 0 auto;
  margin-top: $header-height;
  padding: 0;
}

// ── 移动端 ──
@media (max-width: $breakpoint-md) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: $header-height;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-bg-card);
    padding: $spacing-sm $spacing-md;
    border-bottom: 1px solid var(--color-border);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition:
      transform 0.25s,
      opacity 0.25s;
    z-index: 99;

    &--open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    a {
      padding: 10px $spacing-sm;
      font-size: $font-size-body;
    }
  }
}
</style>
