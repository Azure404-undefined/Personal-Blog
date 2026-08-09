<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CategoryFilter' })

const props = defineProps<{
  categories: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const MAX_VISIBLE_TABS = 5

const visibleCats = computed(() => props.categories.slice(0, MAX_VISIBLE_TABS))
const overflowCats = computed(() => props.categories.slice(MAX_VISIBLE_TABS))
const showOverflow = computed(() => overflowCats.value.length > 0)

const select = (cat: string) => emit('update:modelValue', cat)
</script>

<template>
  <div class="filter-bar">
    <button
      :class="['cat-tag', { 'cat-tag--active': !modelValue }]"
      @click="select('')"
    >
      全部
    </button>
    <button
      v-for="cat in visibleCats"
      :key="cat"
      :class="['cat-tag', { 'cat-tag--active': modelValue === cat }]"
      @click="select(cat)"
    >
      {{ cat }}
    </button>
    <el-select
      v-if="showOverflow"
      :model-value="overflowCats.includes(modelValue) ? modelValue : ''"
      placeholder="更多"
      size="small"
      class="cat-overflow"
      @change="select"
    >
      <el-option v-for="cat in overflowCats" :key="cat" :label="cat" :value="cat" />
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.cat-tag {
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  padding: $spacing-xs 14px;
  border-radius: $radius-xl;
  font-size: $font-size-small;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary-border);
    background: var(--color-primary-bg);
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

.cat-overflow {
  width: 100px;
}
</style>
