<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useScroll } from '@vueuse/core'
import { ArrowDown } from '@element-plus/icons-vue'

defineOptions({ name: 'HeroSection' })

const props = withDefaults(
  defineProps<{
    mini?: boolean
    title?: string
    coverImage?: string
  }>(),
  {
    mini: false,
    title: '',
    coverImage: '',
  },
)

const { y } = useScroll(window)

// 视差缩放：滚动时封面放大 1→1.05
const parallaxScale = computed(() => {
  if (props.mini) return 1
  const scale = 1 + Math.min(y.value / 800, 1) * 0.05
  return Math.min(scale, 1.05)
})

// 问候语透明度：滚动超过 100px 开始渐隐
const greetingOpacity = computed(() => {
  if (props.mini) return 1
  return Math.max(0, 1 - y.value / 300)
})

// 默认封面图（Unsplash 冷色调网图占位）
const defaultCover =
  'src/assets/imgs/shouye.jpg'
const miniDefaultCover =
  'src/assets/imgs/sanjay-hona-YDfUMO4FLwM-unsplash.jpg'

const bgImage = computed(() => {
  if (props.coverImage) return props.coverImage
  return props.mini ? miniDefaultCover : defaultCover
})

  // ── 问候语轮播 ──
  const greetings = ['写代码', '写文章', '记录生活']
  const greetingIndex = ref(0)
  const currentGreeting = computed(() => greetings[greetingIndex.value]!)

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    if (!props.mini) {
      timer = setInterval(() => {
        greetingIndex.value = (greetingIndex.value + 1) % greetings.length
      }, 3000)
    }
  })
  onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="hero" :class="{ 'hero--mini': mini }">
    <div
      class="hero-bg"
      :style="{
        backgroundImage: `url(${bgImage})`,
        transform: `scale(${parallaxScale})`,
      }"
    />
    <div class="hero-overlay" />

    <!-- 首页：问候语 -->
    <div v-if="!mini" class="hero-content" :style="{ opacity: greetingOpacity }">
      <h1 class="hero-greeting">Hi，我是 Azure</h1>
      <Transition name="greeting" mode="out-in">
        <span :key="currentGreeting" class="hero-sub">{{ currentGreeting }}</span>
      </Transition>
      <span class="hero-scroll-hint"><el-icon :size="14"><ArrowDown /></el-icon> 向下滚动</span>
    </div>

    <!-- 其他页面：标题 -->
    <div v-else class="hero-content">
      <h1 class="hero-title">{{ title }}</h1>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  width: 99.7vw;
  margin-left: calc(50% - 50vw);
  margin-top: -$header-height;
  margin-bottom: $header-bottom-margin;
  height: calc(45vh + $header-height);
  min-height: 352px;
  max-height: 552px;
  overflow: hidden;

  &--mini {
    height: 352px;
    min-height: auto;
    max-height: none;
  }
}

.hero-bg {
  position: absolute;
  inset: -10px;
  background: center / cover no-repeat;
  will-change: transform;
  animation: hero-bg-in 0.6s ease-out both;
}

@keyframes hero-bg-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  animation: hero-fade 0.6s ease-out 0.15s both;

  .hero--mini & {
    background: rgba(0, 0, 0, 0.3);
  }
}

@keyframes hero-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
  text-align: center;
  padding: $header-height $spacing-md 0;
  animation: hero-text-up 0.5s ease-out 0.3s both;
}

@keyframes hero-text-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-greeting {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
}

.hero-sub {
  margin: 8px 0 0;
  font-size: 16px;
  opacity: 0.85;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.greeting-enter-active,
.greeting-leave-active {
  transition: opacity 0.4s ease;
}
.greeting-enter-from,
.greeting-leave-to {
  opacity: 0;
}

.hero-scroll-hint {
  margin-top: 20px;
  font-size: 12px;
  opacity: 0.4;
  animation: hero-bounce 2s ease-in-out infinite;
}

.hero-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

@keyframes hero-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}
</style>
