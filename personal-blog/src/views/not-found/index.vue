<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePageMeta } from '@/utils/meta'

defineOptions({ name: 'NotFoundView' })

usePageMeta('页面不存在', '404 页面不存在')

const router = useRouter()
</script>

<template>
  <div class="not-found-page">
    <!-- 内联 SVG: 文字色用 CSS 变量,自动适配暗色模式; emoji 黄色双模式通用 -->
    <svg
      class="nf-svg"
      viewBox="0 0 1600 1000"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="404 页面不存在"
    >
      <!-- Decorative error / code doodles -->
      <g class="doodle" font-size="52" opacity="0.75">
        <text x="300" y="210">?!</text>
        <text x="1160" y="205">¯\_(ツ)_/¯</text>
        <text x="225" y="405">”</text>
        <text x="1280" y="410">...</text>
        <text x="230" y="620">[]</text>
        <text x="1270" y="620">&lt;/&gt;</text>
        <text x="265" y="770">***</text>
        <text x="1235" y="770">#@%!</text>
      </g>

      <!-- Small scribble -->
      <path
        d="M930 190
           C900 160 900 220 935 225
           C970 230 975 175 940 165
           C910 155 905 245 955 245"
        fill="none"
        stroke="var(--color-text-primary)"
        stroke-width="7"
        stroke-linecap="round"
        opacity="0.9"
      />

      <!-- 404 -->
      <text x="485" y="515" class="num" font-size="285">4</text>
      <text x="930" y="515" class="num" font-size="285">4</text>

      <!-- Round emoji as the zero -->
      <g transform="translate(800 425)">
        <circle r="82" fill="#FFBE24" />
        <ellipse cx="-27" cy="-13" rx="12" ry="18" fill="#202938" />
        <ellipse cx="27" cy="-13" rx="12" ry="18" fill="#202938" />
        <path
          d="M-25 37 Q0 15 25 37"
          fill="none"
          stroke="#202938"
          stroke-width="9"
          stroke-linecap="round"
        />
        <path
          d="M18 -37 L39 -50"
          fill="none"
          stroke="#202938"
          stroke-width="8"
          stroke-linecap="round"
        />
      </g>

      <!-- Heading -->
      <text x="800" y="655" text-anchor="middle" class="title" font-size="66">
        Page Not Found
      </text>

      <!-- Supporting copy -->
      <text x="800" y="725" text-anchor="middle" class="body" font-size="31">
        Sorry, the page you're looking for
      </text>
      <text x="800" y="775" text-anchor="middle" class="body" font-size="31">
        doesn't exist or has been moved.
      </text>
    </svg>

    <el-button type="primary" @click="router.push('/')">回到首页</el-button>

    <nav class="nf-links">
      <router-link to="/archive">归档</router-link>
      <span class="nf-sep">·</span>
      <router-link to="/categories">分类</router-link>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.not-found-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  padding: $spacing-xl $spacing-md;
}

// 内联 SVG: 颜色随主题 CSS 变量切换
.nf-svg {
  width: 100%;
  max-width: 500px;
  height: auto;

  :deep(.num),
  :deep(.title) {
    fill: var(--color-text-primary);
  }

  :deep(.body) {
    fill: var(--color-text-secondary);
  }

  :deep(.doodle) {
    fill: var(--color-text-placeholder);
  }
}

.nf-links {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-xs;

  a {
    font-size: $font-size-small;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--color-primary);
    }
  }
}

.nf-sep {
  color: var(--color-text-placeholder);
}
</style>
