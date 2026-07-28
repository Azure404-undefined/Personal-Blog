<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/modules/auth';
import { useAppStore } from '@/stores/modules/app';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const handleSearch = () => {
  const q = searchQuery.value.trim();
  if (q) {
    router.push({ path: '/', query: { q } });
  } else {
    router.push('/');
  }
};

const handleLogout = () => {
  authStore.clearLocalToken();
  appStore.closeMenu();
  router.push('/');
};
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="logo" @click="appStore.closeMenu()">
          📝 个人博客
        </router-link>

        <!-- 导航链接 -->
        <nav class="nav-links" :class="{ 'nav-links--open': appStore.isMenuOpen }">
          <router-link
            to="/"
            :class="{ active: route.path === '/' }"
            @click="appStore.closeMenu()"
          >首页</router-link>
          <router-link
            to="/my-articles"
            :class="{ active: route.path === '/my-articles' }"
            @click="appStore.closeMenu()"
          >我的文章</router-link>
          <router-link
            to="/write"
            :class="{ active: route.path === '/write' }"
            @click="appStore.closeMenu()"
          >写文章</router-link>
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
            <span class="uid">用户</span>
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
    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
// ── tokens ──
$max-width: 1000px;
$header-height: 52px;
$breakpoint: 768px;

$color-text: #303133;
$color-text-secondary: #606266;
$color-text-muted: #909399;
$color-primary: #409eff;
$color-primary-bg: #ecf5ff;
$color-border: var(--el-border-color-light, #e5e5e5);
$color-bg: #fff;
$color-hover-bg: #f0f2f5;

// ── layout ──
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  border-bottom: 1px solid $color-border;
  background: $color-bg;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;

  .header-inner {
    max-width: $max-width;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: $header-height;
    gap: 24px;
  }
}

// ── logo ──
.logo {
  font-size: 16px;
  font-weight: 600;
  color: $color-text;
  text-decoration: none;
  flex-shrink: 0;
}

// ── 导航链接 ──
.nav-links {
  display: flex;
  gap: 4px;

  a {
    color: $color-text-secondary;
    text-decoration: none;
    font-size: 14px;
    padding: 4px 10px;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;

    &:hover {
      color: $color-primary;
      background: $color-primary-bg;
    }

    &.active {
      color: $color-primary;
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
  gap: 10px;
}

.uid {
  font-size: 13px;
  color: $color-text-muted;
}

// ── 汉堡按钮 ──
.hamburger {
  $size: 36px;

  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: $size;
  height: $size;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;

  &:hover {
    background: $color-hover-bg;
  }

  &-line {
    display: block;
    width: 20px;
    height: 2px;
    background: $color-text;
    border-radius: 1px;
    transition: transform 0.3s, opacity 0.3s;
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
  max-width: $max-width;
  width: 100%;
  margin: 0 auto;
  padding: 24px 16px;
}

// ── 移动端 ──
@media (max-width: $breakpoint) {
  .hamburger {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: $header-height;
    left: 0;
    right: 0;
    flex-direction: column;
    background: $color-bg;
    padding: 8px 16px;
    border-bottom: 1px solid $color-border;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.25s, opacity 0.25s;
    z-index: 99;

    &--open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    a {
      padding: 10px 8px;
      font-size: 15px;
    }
  }
}
</style>
