<script setup lang="ts">
import { computed } from 'vue'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { avatarInitial } from '@/utils/avatar'

defineOptions({ name: 'ArticleBanner' })

const props = defineProps<{
  title: string
  coverImage?: string
  category?: string
  authorName?: string
  updatedAt: number
  status?: 'draft' | 'published'
}>()

// 无封面时的默认占位图(与 HeroSection 同款)
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=70'

const cover = computed(() => coverUrl(props.coverImage) || DEFAULT_COVER)
const author = computed(() => props.authorName || '博主')
</script>

<template>
  <div class="detail-banner">
    <img :src="cover" :alt="title" class="banner-img" loading="lazy" />
    <div class="banner-overlay" />
    <div class="banner-text">
      <div class="banner-tags">
        <el-tag v-if="category" size="small" class="banner-tag">{{ category }}</el-tag>
        <el-tag v-if="status === 'draft'" size="small" class="banner-tag banner-tag--draft">草稿</el-tag>
      </div>
      <h1 class="banner-title">{{ title }}</h1>
      <div class="banner-author-row">
        <span class="banner-author-avatar">{{ avatarInitial(author) }}</span>
        <span class="banner-author-name">{{ author }}</span>
      </div>
      <time class="banner-date">{{ fmtDate(updatedAt) }}</time>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.detail-banner {
  position: relative;
  width: 99.7vw;
  margin-left: calc(50% - 50vw);
  margin-top: -$header-height;
  height: calc(33vh + $header-height);
  min-height: 252px;
  max-height: 452px;
  overflow: hidden;
  margin-bottom: $spacing-lg;
}

.banner-img {
  @include cover-img;
  animation: banner-reveal 0.6s ease-out both;
}

@keyframes banner-reveal {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  animation: banner-fade 0.6s ease-out 0.15s both;
}

@keyframes banner-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  animation: banner-text-up 0.5s ease-out 0.3s both;
}

@keyframes banner-text-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-tags {
  display: flex;
  gap: $spacing-sm;
}

.banner-tag {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #fff;

  &--draft {
    background: rgba(230, 162, 60, 0.25);
    border-color: rgba(230, 162, 60, 0.8);
  }
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
</style>
