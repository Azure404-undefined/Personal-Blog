<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'CategoryFilter' })

const props = defineProps<{
  categories: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const filterBarRef = ref<HTMLElement | null>(null)
const measureRef = ref<HTMLElement | null>(null)
const visibleCount = ref(props.categories.length)
const overflowVisible = ref(false)

let resizeObserver: ResizeObserver | null = null
let measureFrame = 0

const visibleCats = computed(() => props.categories.slice(0, visibleCount.value))
const overflowCats = computed(() => props.categories.slice(visibleCount.value))
const showOverflow = computed(() => overflowCats.value.length > 0)
const overflowActive = computed(() => overflowCats.value.includes(props.modelValue))

const calculateVisibleCount = () => {
  const filterBar = filterBarRef.value
  const measure = measureRef.value

  if (!filterBar || !measure) return

  const allButton = measure.querySelector<HTMLElement>('[data-measure-all]')
  const moreButton = measure.querySelector<HTMLElement>('[data-measure-more]')
  const categoryButtons = Array.from(
    measure.querySelectorAll<HTMLElement>('[data-measure-category]'),
  )

  if (!allButton || !moreButton || categoryButtons.length !== props.categories.length) return

  const availableWidth = filterBar.clientWidth
  const gap = Number.parseFloat(getComputedStyle(filterBar).columnGap) || 0
  const allWidth = allButton.getBoundingClientRect().width
  const moreWidth = moreButton.getBoundingClientRect().width
  const categoryWidths = categoryButtons.map((button) => button.getBoundingClientRect().width)
  const fullWidth = categoryWidths.reduce((used, width) => used + gap + width, allWidth)

  if (fullWidth <= availableWidth + 0.5) {
    visibleCount.value = props.categories.length
    overflowVisible.value = false
    return
  }

  const widthReservedForMore = gap + moreWidth
  let usedWidth = allWidth
  let nextVisibleCount = 0

  for (const width of categoryWidths) {
    const widthWithCategory = usedWidth + gap + width

    if (widthWithCategory + widthReservedForMore > availableWidth + 0.5) break

    usedWidth = widthWithCategory
    nextVisibleCount += 1
  }

  visibleCount.value = nextVisibleCount
}

const scheduleMeasure = () => {
  cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(calculateVisibleCount)
}

const select = (cat: string) => {
  overflowVisible.value = false
  emit('update:modelValue', cat)
}

watch(
  () => props.categories,
  async () => {
    visibleCount.value = props.categories.length
    overflowVisible.value = false
    await nextTick()
    scheduleMeasure()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()

  if (filterBarRef.value) {
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(filterBarRef.value)
  }

  scheduleMeasure()
  document.fonts?.ready.then(scheduleMeasure)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  cancelAnimationFrame(measureFrame)
})
</script>

<template>
  <div class="filter-shell">
    <div ref="filterBarRef" class="filter-bar" aria-label="文章分类筛选">
      <button
        type="button"
        :class="['cat-tag', { 'cat-tag--active': !modelValue }]"
        @click="select('')"
      >
        全部
      </button>

      <button
        v-for="cat in visibleCats"
        :key="cat"
        type="button"
        :class="['cat-tag', { 'cat-tag--active': modelValue === cat }]"
        @click="select(cat)"
      >
        {{ cat }}
      </button>

      <el-popover
        v-if="showOverflow"
        v-model:visible="overflowVisible"
        trigger="click"
        placement="bottom-end"
        :width="280"
        role="dialog"
        aria-label="更多文章分类"
      >
        <div
          class="overflow-categories"
          role="group"
          aria-label="更多分类"
          @keydown.esc.stop.prevent="overflowVisible = false"
        >
          <button
            v-for="cat in overflowCats"
            :key="cat"
            type="button"
            :class="['cat-tag', { 'cat-tag--active': modelValue === cat }]"
            @click="select(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <template #reference>
          <button
            type="button"
            :class="['cat-tag', 'cat-more', { 'cat-tag--active': overflowActive }]"
            :aria-expanded="overflowVisible"
            aria-label="显示更多分类"
            @keydown.esc.stop.prevent="overflowVisible = false"
          >
            更多
            <span class="cat-more-arrow" aria-hidden="true"></span>
          </button>
        </template>
      </el-popover>
    </div>

    <div ref="measureRef" class="filter-measure" aria-hidden="true">
      <button type="button" class="cat-tag" tabindex="-1" data-measure-all>全部</button>
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="cat-tag"
        tabindex="-1"
        data-measure-category
      >
        {{ cat }}
      </button>
      <button type="button" class="cat-tag cat-more" tabindex="-1" data-measure-more>
        更多
        <span class="cat-more-arrow" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-shell {
  position: relative;
  width: 100%;
  min-width: 0;
}

.filter-bar,
.filter-measure {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: $spacing-sm;
}

.filter-bar {
  width: 100%;
  overflow: hidden;
  margin-bottom: $spacing-md;
}

.filter-measure {
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
  white-space: nowrap;
}

.cat-tag {
  flex: 0 0 auto;
  padding: $spacing-xs 14px;
  border: 1px solid var(--color-border);
  border-radius: $radius-xl;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  cursor: pointer;
  font-size: $font-size-small;
  white-space: nowrap;
  transition:
    color 0.2s,
    background-color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-bg);
    border-color: var(--color-primary-border);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &--active {
    color: #fff;
    background: var(--color-primary);
    border-color: var(--color-primary);

    &:hover {
      color: #fff;
      background: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }
  }
}

.cat-more {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
}

.cat-more-arrow {
  width: 6px;
  height: 6px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
}

.overflow-categories {
  display: flex;
  max-height: 240px;
  flex-wrap: wrap;
  gap: $spacing-sm;
  overflow-y: auto;
  padding: $spacing-xs;
}
</style>
