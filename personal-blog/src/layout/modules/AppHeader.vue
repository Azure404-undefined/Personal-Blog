<script setup lang="ts">
import { watch, computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { useAppStore } from '@/stores/modules/app'
import { useRouter, useRoute } from 'vue-router'
import { useScroll } from '@vueuse/core'
import {
  Search,
  Sunny,
  Moon,
  HomeFilled,
  Document,
  EditPen,
  SwitchButton,
  User,
  InfoFilled,
  Collection,
  Clock,
  Link,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { avatarInitial } from '@/utils/avatar'

const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const { y, directions } = useScroll(window, { throttle: 100 })

const isOverHero = computed(() => y.value < 200)

const headerBgOpacity = computed(() => {
  if (y.value < 20) return 0
  if (y.value < 200) return Math.min((y.value - 20) / 180, 1) * 0.15
  return 1
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return // 用户取消
  }
  authStore.clearLocalToken()
  appStore.closeMenu()
  router.push('/')
}

watch(
  y,
  () => {
    if (y.value > 52 && directions.bottom) {
      appStore.setHeaderVisibility(false)
    } else if (directions.top) {
      appStore.setHeaderVisibility(true)
    }
    console.log(y.value)
  },
)
</script>

<template>
  <header
    class="app-header"
    :class="{
      hidden: !appStore.setHeaderVisible,
      'over-hero': isOverHero,
    }"
    :style="isOverHero ? { '--header-bg-alpha': headerBgOpacity } : {}"
  >
    <div class="header-inner">
      <!-- 登录后：头像 + 用户名 + 登出 -->
      <template v-if="authStore.isLogin">
        <router-link to="/" class="logo logo--user" @click="appStore.closeMenu()">
          <span class="avatar-circle">{{ avatarInitial(authStore.username) }}</span>
          <span class="logo-username">{{ authStore.username }}</span>
        </router-link>
        <button class="logo-logout" @click="handleLogout">
          <el-icon :size="14"><SwitchButton /></el-icon>
          <span>登出</span>
        </button>
      </template>
      <!-- 未登录：登录头像 -->
      <button v-else class="logo logo--user" @click="appStore.openLoginModal()">
        <span class="avatar-circle avatar-circle--login">
          <el-icon :size="14"><User /></el-icon>
          <span>登录</span>
        </span>
      </button>

      <div class="user-area">
        <button class="search-trigger" @click="appStore.openSearchModal()">
          <el-icon :size="15"><Search /></el-icon>
          <span class="search-trigger-text">搜索...</span>
          <kbd>Ctrl+K</kbd>
        </button>

        <nav class="nav-links" :class="{ 'nav-links--open': appStore.isMenuOpen }">
        <router-link to="/" :class="{ active: route.path === '/' }" @click="appStore.closeMenu()">
          <el-icon :size="15"><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link
          to="/my-articles"
          :class="{ active: route.path === '/my-articles' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><Document /></el-icon>
          <span>我的文章</span>
        </router-link>
        <router-link
          to="/write"
          :class="{ active: route.path === '/write' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><EditPen /></el-icon>
          <span>写文章</span>
        </router-link>
        <router-link
          to="/about"
          :class="{ active: route.path === '/about' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><InfoFilled /></el-icon>
          <span>关于</span>
        </router-link>
        <router-link
          to="/categories"
          :class="{ active: route.path === '/categories' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><Collection /></el-icon>
          <span>分类</span>
        </router-link>
        <router-link
          to="/archive"
          :class="{ active: route.path === '/archive' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><Clock /></el-icon>
          <span>归档</span>
        </router-link>
        <router-link
          to="/friends"
          :class="{ active: route.path === '/friends' }"
          @click="appStore.closeMenu()"
        >
          <el-icon :size="15"><Link /></el-icon>
          <span>友链</span>
        </router-link>
      </nav>

        <button
          class="theme-switch"
          :class="{ 'is-dark': appStore.isDark }"
          @click="appStore.toggleTheme()"
          :aria-label="appStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
        >
          <el-icon class="theme-switch-icon theme-switch-icon--moon"><Moon /></el-icon>
          <el-icon class="theme-switch-icon theme-switch-icon--sun"><Sunny /></el-icon>
          <span class="theme-switch-knob" />
        </button>

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

    <!-- 移动端: 菜单展开时点击空白区域关闭(Teleport 到 body,脱离 header 的 stacking context) -->
    <Teleport to="body">
      <div
        v-if="appStore.isMenuOpen"
        class="menu-backdrop"
        @click="appStore.closeMenu()"
      />
    </Teleport>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  border-bottom: 1px solid transparent;
  background: rgba(29, 30, 31, 0.6);
  padding: 0;
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  transition:
    transform 0.5s ease,
    background 0.3s ease;

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

  &.over-hero {
    background: rgba(15, 23, 42, var(--header-bg-alpha, 0));
  }
}

// ── 内部元素：统一亮色文字 ──
.logo {
  flex-shrink: 0;
  margin-left: $spacing-lg;
}

// ── 登录态/未登录 logo（头像 + 用户名） ──
.logo--user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  text-decoration: none;
  border: none;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
}

.avatar-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;

  &--login {
    width: auto;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.logo-username {
  max-width: 120px;
  padding-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
  font-size: $font-size-body;
  font-weight: 600;
}

.logo-logout {
  margin-left: -12px;
  padding: 4px 8px;
  width: 60px;
  height: 28px;
  border-radius: $radius-sm;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: $font-size-small;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.nav-links {
  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: $font-size-small;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    transition:
      color 0.2s,
      background 0.2s;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.3);
    }

    &.active {
      color: var(--color-primary);
    }
  }
}

.theme-switch {
  position: relative;
  width: 48px;
  height: 26px;
  border: none;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;

  &.is-dark {
    background: rgba(96, 165, 250, 0.2);
  }
}

.theme-switch-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  pointer-events: none;

  &--moon {
    left: 5px;
    color: #e2e8f0;
  }

  &--sun {
    right: 5px;
    color: #fbbf24;
  }
}

.theme-switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s ease;
  pointer-events: none;
}

.theme-switch.is-dark .theme-switch-knob {
  transform: translateX(22px);
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: $radius-md;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  transition:
    border-color 0.15s,
    color 0.15s;

  kbd {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    font-size: 11px;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 4px;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.85);
  }
}

.hamburger-line {
  background: rgba(255, 255, 255, 0.9);
}

// ── 导航链接（布局） ──
.nav-links {
  display: flex;
  gap: $spacing-xs;
}

// ── 用户区 ──
.user-area {
  margin-left: auto;
  margin-right: $spacing-lg;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
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
    background: rgba(255, 255, 255, 0.9);
    border-radius: 1px;
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

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

// ── 菜单遮罩(Teleport 到 body,点击空白关闭) ──
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 98; // 低于 header(100),高于页面内容
  background: rgba(0, 0, 0, 0.3);

  // 桌面端汉堡菜单不可见,遮罩无意义
  @media (min-width: $breakpoint-md) {
    display: none;
  }
}

// ── 移动端 ──
@media (max-width: $breakpoint-md) {
  .logo {
    margin-left: $spacing-md;
  }

  .user-area {
    margin-right: $spacing-md;
  }

  .search-trigger {
    padding: 5px 8px;

    .search-trigger-text,
    kbd {
      display: none;
    }
  }

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
      color: var(--color-text-primary);
    }
  }
}
</style>
