<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import HeroSection from '@/components/HeroSection.vue'
import SafeContent from '@/components/safeContent.vue'
import { usePageMeta } from '@/utils/meta'
import aboutImg from '@/assets/imgs/ykaiavu-cat-8438334.jpg'

defineOptions({ name: 'AboutView' })

usePageMeta('关于我', 'Azure 的个人简介与博客介绍')

const md = new MarkdownIt({ breaks: true, linkify: true })

const aboutMarkdown = `
## 关于我

你好，我是 **Azure** —— 一个喜欢写代码、写文章、记录生活的开发者。

### 这个博客

这个博客由 Vue 3 + CloudBase 构建，记录了我在技术路上的思考与实践。

### 兴趣方向

- Web 前端开发（Vue / TypeScript）
- 云开发与 Serverless 架构
- 阅读与写作

### 联系我

- GitHub: [github.com](https://github.com)
- 邮箱: hello@example.com

> 保持好奇，持续学习。
`

const html = computed(() => md.render(aboutMarkdown))
</script>

<template>
  <div class="about-page">
    <HeroSection mini :cover-image="aboutImg" title="关于我" />

    <div class="about-body">
      <SafeContent :html="html" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  margin: 0 auto;
  padding: 0 $spacing-md;
}

.about-body {
  @include prose-typography;
  max-width: 780px;
  margin: 0 auto;
  padding: $spacing-md;
  @include reveal;
  font-size: $font-size-body;
  line-height: 1.85;
  color: var(--color-text-primary);
  word-break: break-word;
}
</style>
