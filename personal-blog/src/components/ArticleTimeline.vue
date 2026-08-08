<script setup lang="ts">
import { computed } from 'vue'
import TimelineEntry from './TimelineEntry.vue'

defineOptions({ name: 'ArticleTimeline' })

interface MonthGroup {
  month: number
  articles: API.Articles.Article[]
}

interface YearGroup {
  year: number
  months: MonthGroup[]
}

const props = withDefaults(
  defineProps<{
    articles: API.Articles.Article[]
    /** 按年/月分组(归档); false 时为无分组平铺(我的文章) */
    grouped?: boolean
    showExcerpt?: boolean
  }>(),
  { grouped: true, showExcerpt: false },
)

// 按年/月分组,保持时间降序
const groups = computed<YearGroup[]>(() => {
  const years = new Map<number, Map<number, API.Articles.Article[]>>()
  for (const a of props.articles) {
    const d = new Date(a.createdAt)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    if (!years.has(y)) years.set(y, new Map())
    const months = years.get(y)!
    if (!months.has(m)) months.set(m, [])
    months.get(m)!.push(a)
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, list]) => ({ month, articles: list })),
    }))
})
</script>

<template>
  <!-- 分组模式: 年/月标题 + 左侧时间轴线 -->
  <template v-if="grouped">
    <section v-for="group in groups" :key="group.year" class="year-group">
      <h2 class="year-title">{{ group.year }}</h2>
      <div class="month-list">
        <div v-for="month in group.months" :key="month.month" class="month-group">
          <h3 class="month-title">{{ month.month }}月</h3>
          <TimelineEntry
            v-for="item in month.articles"
            :key="item._id"
            :article="item"
            :show-excerpt="showExcerpt"
          >
            <template v-if="$slots.actions" #actions="{ article }">
              <slot name="actions" :article="article" />
            </template>
          </TimelineEntry>
        </div>
      </div>
    </section>
  </template>

  <!-- 平铺模式: 相同条目样式, 无分组 -->
  <div v-else class="flat-list">
    <TimelineEntry
      v-for="item in articles"
      :key="item._id"
      :article="item"
      :show-excerpt="showExcerpt"
    >
      <template v-if="$slots.actions" #actions="{ article }">
        <slot name="actions" :article="article" />
      </template>
    </TimelineEntry>
  </div>
</template>

<style lang="scss" scoped>
.year-group {
  margin-bottom: $spacing-xl;
}

.year-title {
  margin: 0 0 $spacing-md;
  font-size: $font-size-h1;
  font-weight: 700;
  color: var(--color-text-primary);
}

// 左侧时间轴线
.month-list {
  border-left: 2px solid var(--color-border);
  margin-left: $spacing-sm;
  padding-left: $spacing-lg;
}

.month-title {
  margin: 0 0 $spacing-sm;
  font-size: $font-size-h2;
  font-weight: 600;
  color: var(--color-text-secondary);
  position: relative;

  // 轴线上的节点
  &::before {
    content: '';
    position: absolute;
    left: -($spacing-lg + 5px);
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid var(--color-bg-page);
  }
}

.flat-list {
  display: flex;
  flex-direction: column;
}
</style>
