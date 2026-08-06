<script setup lang="ts">
import AppHeader from './modules/AppHeader.vue'
import AppFooter from './modules/AppFooter.vue'
import LoginModal from '@/components/LoginModal.vue'
import SearchModal from '@/components/SearchModal.vue'
import BackToTop from '@/components/BackToTop.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-main">
      <slot />
    </main>

    <AppFooter />

    <LoginModal />
    <SearchModal />
    <BackToTop />
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
