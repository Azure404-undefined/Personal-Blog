<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/LoginForm.vue'

defineOptions({ name: 'LoginView' })

// const PANEL_IMAGE = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=800&fit=crop'

const imgError = ref(false)
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 左侧：登录表单 -->
      <div class="login-left">
        <LoginForm align="left" />
      </div>

      <!-- 右侧：装饰图片 -->
      <div class="login-right">
        <img
          v-if="!imgError"
          src="../../assets/imgs/jiedao.jpg"
          alt=""
          class="login-right-img"
          loading="eager"
          @error="imgError = true"
        />
        <div v-else class="login-right-fallback" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: calc(100vh - $header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  box-sizing: border-box;
  &::before {
    content: '';
    margin-top: -$header-height;
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #409eff 0%, #00bcd4 100%);
    opacity: 0.5;
    z-index: -1;
  }
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 520px;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.login-left {
  flex: 0 0 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px $spacing-2xl;
  box-sizing: border-box;
}

.login-right {
  flex: 1;
  position: relative;
  background: var(--color-bg-hover);
}

.login-right-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.login-right-fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #409eff 0%, #00bcd4 100%);
}

@media (max-width: $breakpoint-md) {
  .login-page {
    padding: $spacing-md;
  }

  .login-card {
    min-height: auto;
  }

  .login-right {
    display: none;
  }

  .login-left {
    flex: 1;
    padding: $spacing-xl $spacing-lg;
  }
}
</style>
