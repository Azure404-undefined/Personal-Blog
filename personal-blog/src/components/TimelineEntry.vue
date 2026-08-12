<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { categoryColor } from '@/utils/category'
import { excerpt } from '@/utils/text'

defineOptions({ name: 'TimelineEntry' })

const props = withDefaults(
  defineProps<{
    article: API.Articles.Article
    showExcerpt?: boolean
  }>(),
  { showExcerpt: false },
)

const router = useRouter()

const cover = computed(() => coverUrl(props.article.coverImage))
const go = () => router.push(`/articles/${props.article._id}`)
</script>

<template>
  <div class="tl-entry" @click="go">
    <!-- 封面缩略图; 无封面时用分类色渐变占位 -->
    <img
      v-if="cover"
      :src="cover"
      :alt="article.title"
      class="entry-cover"
      loading="lazy"
    />
    <div
      v-else
      class="entry-cover entry-cover--fallback"
      :style="{ backgroundImage: `linear-gradient(135deg, ${categoryColor(article.category || '')}, transparent)` }"
    />

    <div class="entry-body">
      <h4 class="entry-title">{{ article.title }}</h4>
      <div class="entry-meta">
        <time>{{ fmtDate(article.createdAt) }}</time>
        <span v-if="article.status === 'draft'" class="entry-status">草稿</span>
        <span
          v-if="article.category"
          class="entry-cat"
          :style="{ color: categoryColor(article.category) }"
        >
          {{ article.category }}
        </span>
      </div>
      <p v-if="showExcerpt" class="entry-excerpt">{{ excerpt(article.content, 90) }}</p>
    </div>

    <!-- 操作按钮(编辑/删除等), 由父组件注入 -->
    <div v-if="$slots.actions" class="entry-actions" @click.stop>
      <slot name="actions" :article="article" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tl-entry {
  @include reveal;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-sm 0;
  cursor: pointer;
  border-radius: $radius-sm;
  transition:
    background 0.2s,
    transform 0.25s ease;

  &:hover {
    background: var(--color-bg-hover);
    transform: translateX(4px);

    .entry-cover {
      transform: scale(1.05);
    }
  }
}

.entry-cover {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: $radius-md;
  object-fit: cover;
  display: block;
  background: var(--color-bg-hover);
  transition: transform 0.3s ease;
}

.entry-body {
  flex: 1;
  min-width: 0;
}

.entry-title {
  margin: 0 0 4px;
  font-size: $font-size-body;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
}

.entry-cat {
  font-weight: 500;
}

.entry-status {
  font-size: 11px;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
  border-radius: $radius-sm;
  padding: 0 5px;
  line-height: 1.4;
}

.entry-excerpt {
  margin: 4px 0 0;
  font-size: $font-size-small;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-left: auto;
  align-self: center;
}

@media (max-width: $breakpoint-sm) {
  .entry-cover {
    width: 80px;
    height: 80px;
  }

  .entry-actions {
    display: flex;
    flex-direction: column;
    :deep(.el-button+.el-button) {
      margin-left: 0;
      margin-top: $spacing-sm;

    }
  }
}
</style>
