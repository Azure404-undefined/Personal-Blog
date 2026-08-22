<script setup lang="ts">
import authAvatar from '@/assets/imgs/authavatar.jpg'
import ContactLinks from '@/components/ContactLinks.vue'

defineOptions({ name: 'ProfileSidebar' })

defineProps<{
  articleCount: number
  categoryCount: number
}>()
</script>

<template>
  <aside class="profile-sidebar">
    <section class="profile-card" aria-label="个人介绍">
      <div class="profile-header" aria-hidden="true"></div>

      <div class="profile-content">
        <div class="profile-avatar">
          <img class="profile-avatar-img" :src="authAvatar" alt="Azure 头像" />
          <h2 class="profile-name">Azure</h2>
        </div>
        <p class="profile-bio">好饿啊~吃点什么好呢</p>
      </div>

      <!-- 数据统计：位于个人介绍和联系方式之间 -->
      <div class="stats-card" aria-label="数据统计">
        <div class="stat">
          <span class="stat-label">文章</span>
          <span class="stat-number">{{ articleCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">分类</span>
          <span class="stat-number">{{ categoryCount }}</span>
        </div>
      </div>

      <!-- 联系方式：个人介绍卡片的 footer -->
      <div class="contact-footer" aria-label="联系方式">
        <div class="contact-heading">
          <h3>联系我</h3>
        </div>
        <ContactLinks />
      </div>
    </section>

    <section class="announcement-card" aria-labelledby="announcement-title">
      <div class="announcement-heading">
        <span class="announcement-mark" aria-hidden="true"></span>
        <h2 id="announcement-title">公告</h2>
      </div>
      <p>源码github地址：https://github.com/Azure404-undefined/Personal-Blog</p>
      <p class="announcement-note">新内容会持续整理更新，欢迎常回来看看。保持好奇，持续学习。</p>
    </section>
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
  padding: 0;
}

.profile-header {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: var(--color-primary-bg);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to top, var(--color-primary-bg), transparent 60%),
      url('@/assets/imgs/deepfish.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.85;
  }
}

.profile-content {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  margin-top: -40px;
  padding: 0 $spacing-lg $spacing-lg;
}

.profile-avatar {
  margin-left: $spacing-2xl;
  display: flex;
  width: 100%;
  align-items: flex-end;
  justify-content: flex-start;
  gap: $spacing-sm;
}

.profile-avatar-img {
  width: 80px;
  height: 80px;
  flex: 0 0 auto;
  border: 3px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  background: var(--color-bg-card);
  object-fit: cover;
  transition: transform 0.3s;

  &:hover {
    transform: rotate(-10deg) scale(1.1);
  }
}

.profile-name {
  margin: 0 0 $spacing-sm;
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

// ── 统计区域：卡片内部，不再作为独立卡片 ──
.stats-card {
  display: grid;
  width: 85%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-lg;
  padding: 0 $spacing-lg $spacing-md;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stat-number {
  font-size: $font-size-h2;
  font-weight: 700;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: $font-size-small;
  font-weight: 500;
  color: var(--color-text-muted);
}

// ── 联系方式 footer ──
.contact-footer {
  display: flex;
  width: 85%;
  flex-direction: column;
  gap: $spacing-sm;
  padding-bottom: $spacing-md;
}

.contact-heading h3 {
  margin: 0;
  font-size: $font-size-small;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: left;
}

// ── 公告卡 ──
.announcement-card {
  @include card-base;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-lg;
  text-align: left;

  p {
    margin: 0;
    font-size: $font-size-small;
    line-height: 1.7;
    color: var(--color-text-secondary);
  }
}

.announcement-heading {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  h2 {
    margin: 0;
    font-size: $font-size-body;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.announcement-mark {
  width: 4px;
  height: 20px;
  flex: 0 0 auto;
  border-radius: $radius-sm;
  background: var(--color-primary);
}

.announcement-note {
  color: var(--color-text-muted) !important;
}

</style>
