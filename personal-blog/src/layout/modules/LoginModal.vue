<script setup lang="ts">
import { watch } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { Close } from '@element-plus/icons-vue'
import LoginForm from '@/components/LoginForm.vue'

defineOptions({ name: 'LoginModal' })

const appStore = useAppStore()

const close = () => {
  appStore.closeLoginModal()
}

// 弹窗打开时禁止 body 滚动
watch(
  () => appStore.showLoginModal,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
)

const onLoginSuccess = () => {
  close()
}
</script>

<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="appStore.showLoginModal" class="modal-overlay" @click.self="close">
        <div class="modal-card">
          <button class="modal-close" @click="close" aria-label="关闭">
            <el-icon :size="14"><Close /></el-icon>
          </button>
          <LoginForm @success="onLoginSuccess" />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;
}

.modal-card {
  position: relative;
  width: 380px;
  max-width: 90vw;
  background: var(--color-bg-card);
  border-radius: $radius-lg;
  padding: 36px 32px 32px;
  box-shadow: var(--shadow-xl);
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--color-bg-hover);
  border-radius: 50%;
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }
}

// ── 弹窗动画 ──
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95);
}
</style>
