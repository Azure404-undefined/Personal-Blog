<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticles } from '@/services/api/articles'
import HeroSection from '@/components/HeroSection.vue'
import ArticleTimeline from '@/components/ArticleTimeline.vue'
import { usePageMeta } from '@/utils/meta'

defineOptions({ name: 'ArchiveView' })

usePageMeta('文章归档', 'Azure 博客全部文章的时间轴归档')

const loading = ref(true)
const error = ref('')
const articles = ref<API.Articles.Article[]>([])

const fetchArchive = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getArticles({ page: 1, pageSize: 200 })
    articles.value = res.records
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败,请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(fetchArchive)
</script>

<template>
  <div class="archive-page">
    <HeroSection mini title="时间轴" />

    <div v-if="loading" class="state-loading" />

    <div v-else-if="error" class="state-box">
      <p class="state-text error-text">{{ error }}</p>
      <el-button @click="fetchArchive">重试</el-button>
    </div>

    <div v-else-if="!articles.length" class="state-box">
      <p class="state-text">还没有文章</p>
    </div>

    <div v-else class="archive-body">
      <ArticleTimeline :articles="articles" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.archive-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.state-loading {
  @include state-spinner;
}
.state-box {
  @include state-box;
}
.state-text {
  @include state-text;
}
.error-text {
  @include state-error-text;
}

.archive-body {
  max-width: 720px;
  margin: 0 auto;
  padding: $spacing-md;
}
</style>
