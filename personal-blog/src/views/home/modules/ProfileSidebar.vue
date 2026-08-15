<script setup lang="ts">
import { avatarInitial } from '@/utils/avatar'

defineOptions({ name: 'ProfileSidebar' })

defineProps<{
  articleCount: number
  categoryCount: number
}>()
</script>

<template>
  <aside class="profile-sidebar">
    <!-- 自我介绍 -->
    <div class="profile-card">
      <span class="profile-avatar">{{ avatarInitial('Azure') }}</span>
      <h2 class="profile-name">Azure</h2>
      <p class="profile-bio">
        一个喜欢写代码、写文章、记录生活的开发者。这个博客由 Vue 3 + CloudBase 构建。
      </p>
      <a class="profile-link" href="https://github.com" target="_blank" rel="noopener">
        GitHub ↗
      </a>
    </div>

    <!-- 数据统计 -->
    <div class="stats-card">
      <div class="stat">
        <span class="stat-number">{{ articleCount }}</span>
        <span class="stat-label">文章</span>
      </div>
      <div class="stat-divider" />
      <div class="stat">
        <span class="stat-number">{{ categoryCount }}</span>
        <span class="stat-label">分类</span>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  position: sticky;
  top: calc($header-height + $spacing-md);
}

// ── 自我介绍卡 ──
.profile-card {
  @include card-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: $spacing-xl $spacing-lg;
  gap: $spacing-sm;
}

.profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  user-select: none;
}

.profile-name {
  margin: 0;
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-primary);
}

.profile-bio {
  margin: 0;
  font-size: $font-size-small;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.profile-link {
  font-size: $font-size-small;
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: var(--color-primary-hover);
  }
}

// ── 统计卡 ──
.stats-card {
  @include card-base;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  gap: $spacing-xl;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 64px;
}

.stat-number {
  font-size: $font-size-h1;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: $font-size-small;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}
</style>
