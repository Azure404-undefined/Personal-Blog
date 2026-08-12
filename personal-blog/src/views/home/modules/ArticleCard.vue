<script setup lang="ts">
import { useRouter } from 'vue-router'
import { fmtDate } from '@/utils/date'
import { coverUrl } from '@/utils/image'
import { avatarInitial } from '@/utils/avatar'
import { categoryColor } from '@/utils/category'
import { excerpt } from '@/utils/text'

defineOptions({ name: 'ArticleCard' })

const props = defineProps<{
  article: API.Articles.Article
}>()

const router = useRouter()
const go = () => router.push(`/articles/${props.article._id}`)
</script>

<template>
  <article class="article-card" @click="go">
    <div class="card-cover-wrap">
      <img
        v-if="coverUrl(article.coverImage)"
        :src="coverUrl(article.coverImage)"
        :alt="article.title"
        class="card-cover-img"
        loading="lazy"
      />
      <div v-else class="card-cover-fallback" />
      <span
        v-if="article.category"
        class="card-category-badge"
        :style="{ backgroundColor: categoryColor(article.category) }"
        >{{ article.category }}</span
      >
    </div>
    <div class="card-body">
      <h2 class="card-title">{{ article.title }}</h2>
      <p class="card-excerpt">{{ excerpt(article.content) }}</p>
      <div class="card-footer">
        <span class="card-author-avatar">
          {{ avatarInitial(article.authorName || '博主') }}
        </span>
        <span class="card-author-name">{{ article.authorName || '博主' }}</span>
        <time class="card-date">{{ fmtDate(article.createdAt) }}</time>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.article-card {
  @include card-base;
  @include reveal;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.card-cover-wrap {
  @include cover-wrap;
}

.card-cover-img {
  @include cover-img;
  transition: transform 0.4s ease;

  .article-card:hover & {
    transform: scale(1.06);
  }
}

.card-cover-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-border-light), var(--color-bg-hover));
}

.card-category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 12px;
  border-radius: $radius-sm;
  font-size: $font-size-small;
  font-weight: 500;
  color: #fff;
  line-height: 1.6;
  pointer-events: none;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-lg;
}

.card-title {
  margin: 0 0 $spacing-sm;
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;

  .article-card:hover & {
    color: var(--color-primary);
  }
}

.card-excerpt {
  margin: 0 0 10px;
  font-size: $font-size-small;
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-author-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;
}

.card-author-name {
  font-size: $font-size-small;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.card-date {
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
  margin-left: auto;
}
</style>
