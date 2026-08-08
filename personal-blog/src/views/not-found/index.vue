<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({ name: 'NotFoundView' })

const router = useRouter()
</script>

<template>
  <div class="not-found-page">
    <div class="nf-content">
      <p class="nf-code">404</p>
      <p class="nf-text">页面不存在或已被移除</p>
      <el-button type="primary" @click="router.push('/')">回到首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-md;
}

.nf-content {
  @include state-box;
  gap: $spacing-md;
}

.nf-code {
  margin: 0;
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-text {
  margin: 0;
  font-size: $font-size-body;
  color: var(--color-text-secondary);
}
</style>
