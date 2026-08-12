<script setup lang="ts">
import { computed } from 'vue'
import { useScroll } from '@vueuse/core'
import { ArrowUp } from '@element-plus/icons-vue'

defineOptions({ name: 'BackToTop' })

const { y } = useScroll(window)

const visible = computed(() => y.value > window.innerHeight)

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <transition name="btp">
    <button v-if="visible" title="回到顶部" class="back-to-top" @click="scrollToTop" aria-label="回到顶部">
      <el-icon :size="18"><ArrowUp /></el-icon>
    </button>
  </transition>
</template>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 99;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;

  &:hover {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }
}

.btp-enter-active,
.btp-leave-active {
  transition: all 0.25s ease;
}

.btp-enter-from,
.btp-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
