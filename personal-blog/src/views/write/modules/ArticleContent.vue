<script setup lang="ts">
import { computed } from 'vue'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { avatarInitial } from '@/utils/avatar'
import SafeContent from '@/components/safeContent.vue'

defineOptions({ name: 'ArticleContent' })

const props = withDefaults(
  defineProps<{
    title: string
    html: string
    coverImage?: string
    category?: string
    authorName?: string
    updatedAt?: number
    /** 预览模式: banner 收缩在容器内,不撑满视口 */
    contained?: boolean
  }>(),
  { contained: false },
)

// 无封面时用默认占位图(与 HeroSection 同款)
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=70'

const cover = computed(() => coverUrl(props.coverImage) || DEFAULT_COVER)
const author = computed(() => props.authorName || '博主')
const date = computed(() => fmtDate(props.updatedAt ?? Date.now()))
</script>

<template>
  <div class="article-content" :class="{ 'article-content--contained': contained }">
    <!-- 封面 banner: 有封面用封面,没有用占位图,结构始终一致 -->
    <div class="detail-banner">
      <img :src="cover" :alt="title" class="banner-img" loading="lazy" />
      <div class="banner-overlay" />
      <div class="banner-text">
        <el-tag v-if="category" size="small" class="banner-tag">{{ category }}</el-tag>
        <h1 class="banner-title">{{ title }}</h1>
        <div class="banner-author-row">
          <span class="banner-author-avatar">{{ avatarInitial(author) }}</span>
          <span class="banner-author-name">{{ author }}</span>
        </div>
        <time class="banner-date">{{ date }}</time>
      </div>
    </div>

    <!-- 详情页操作按钮(编辑/删除)插入点,预览场景为空 -->
    <slot name="actions" />

    <div class="detail-body">
      <SafeContent :html="html" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-content {
  margin: 0 auto;
}

// ── 封面 banner ──
.detail-banner {
  position: relative;
  width: 99.7vw;
  margin-left: calc(50% - 50vw);
  margin-top: -$header-height; // 延伸到 header 后方
  height: calc(33vh + $header-height);
  min-height: 252px; // 200 + 52
  max-height: 452px; // 400 + 52
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.banner-img {
  @include cover-img;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.banner-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $header-height $spacing-lg 0;
  text-align: center;
}

.banner-tag {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;
}

.banner-title {
  margin: 0;
  font-size: $font-size-display;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.banner-date {
  font-size: $font-size-small;
  color: rgba(255, 255, 255, 0.85);
}

.banner-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  user-select: none;
}

.banner-author-name {
  font-size: $font-size-small;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

// ── 正文 ──
.detail-body {
  @include prose-typography;
  @include reveal;
  font-size: $font-size-body;
  line-height: 1.85;
  color: var(--color-text-primary);
  word-break: break-word;

  :deep(h2),
  :deep(h3),
  :deep(h4) {
    scroll-margin-top: calc($header-height + $spacing-lg);
  }
}

// ── 预览模式: banner 收缩在容器内 ──
.article-content--contained {
  .detail-banner {
    width: 100%;
    margin-left: 0;
    margin-top: 0;
    height: 180px;
    min-height: 0;
    max-height: none;
  }

  .banner-text {
    padding: 0 $spacing-lg;
  }

  .detail-body {
    padding: $spacing-md;
  }
}
</style>
