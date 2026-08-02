<script setup lang="ts">
import LoginForm from '@/components/LoginForm.vue'

defineOptions({ name: 'LoginView' })
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <LoginForm />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: calc(100vh - $header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-page);
}

.login-card {
  width: 380px;
  max-width: 90vw;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  padding: 40px $spacing-xl;
  box-shadow: var(--shadow-md);
}
</style>
