<script setup lang="ts">
import { ref, computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

defineOptions({ name: 'TocEditor' })

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  'update:content': [value: string]
  /** 新增标题: 父组件插入到光标处 */
  insert: [text: string]
}>()

interface HeadingItem {
  index: number
  level: 2 | 3 | 4
  text: string
}

// 从正文解析标题(编辑器 → 列表)
const headings = computed<HeadingItem[]>(() =>
  [...props.content.matchAll(/^(#{2,4})\s+(.+)$/gm)].map((m, i) => ({
    index: i,
    level: m[1]!.length as 2 | 3 | 4,
    text: m[2]!.trim(),
  })),
)

const newHeadingText = ref('')
const newHeadingLevel = ref<2 | 3 | 4>(2)

const addHeading = () => {
  const t = newHeadingText.value.trim()
  if (!t) return
  emit('insert', `\n${'#'.repeat(newHeadingLevel.value)} ${t}\n`)
  newHeadingText.value = ''
}

const editingIndex = ref(-1)
const editText = ref('')

const startEdit = (item: HeadingItem) => {
  editingIndex.value = item.index
  editText.value = item.text
}

const saveEdit = () => {
  const idx = editingIndex.value
  editingIndex.value = -1
  if (idx < 0) return
  const t = editText.value.trim()
  if (!t) return
  let i = 0
  emit(
    'update:content',
    props.content.replace(/^(#{2,4})\s+(.+)$/gm, (full, hashes) =>
      i++ === idx ? `${hashes} ${t}` : full,
    ),
  )
}

// 删除标题: 按 index 定位第 N 个标题行删除
const removeHeading = (item: HeadingItem) => {
  let i = 0
  let next = props.content.replace(/^#{2,4}\s+.+$/gm, (match) =>
    i++ === item.index ? '' : match,
  )
  // 清理删除后留下的多余空行
  next = next.replace(/\n{3,}/g, '\n\n')
  emit('update:content', next)
}
</script>

<template>
  <div class="toc-editor">
    <!-- 新增标题 -->
    <div class="toc-add-row">
      <el-input
        v-model="newHeadingText"
        placeholder="新标题..."
        @keyup.enter="addHeading"
      />
      <el-select v-model="newHeadingLevel" class="toc-level-select">
        <el-option label="H2" :value="2" />
        <el-option label="H3" :value="3" />
        <el-option label="H4" :value="4" />
      </el-select>
      <el-button title="点击添加" type="primary" circle @click="addHeading">+</el-button>
    </div>

    <!-- 已有标题列表 -->
    <div v-if="headings.length" class="toc-list">
      <div v-for="item in headings" :key="item.index" class="toc-row">
        <span class="toc-level" :class="`toc-level--h${item.level}`">
          H{{ item.level }}
        </span>
        <input
          v-if="editingIndex === item.index"
          v-model="editText"
          class="toc-edit-input"
          @blur="saveEdit"
          @keyup.enter="saveEdit"
        />
        <span v-else class="toc-text" :title="'双击编辑'" @dblclick="startEdit(item)">
          {{ item.text }}
        </span>
        <el-button
          size="small"
          circle
          type="danger"
          class="toc-remove"
          @click="removeHeading(item)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
    <p v-else class="toc-empty">暂无标题<br />正文中以 ## / ### / #### 开头即可</p>
  </div>
</template>

<style lang="scss" scoped>
.toc-editor {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.toc-add-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  :deep(.el-button.is-circle) {
    width: 40px;
  }
}

.toc-level-select {
  width: 65px;
  flex-shrink: 0;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  max-height: 40vh;
  overflow-y: auto;
}

.toc-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 4px $spacing-xs;
  border-radius: $radius-sm;
  transition: background 0.15s;

  &:hover {
    background: var(--color-bg-hover);
  }
}

.toc-level {
  flex-shrink: 0;
  min-width: 26px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: $radius-sm;
  color: #fff;

  &--h2 {
    background: var(--color-cat-0);
  }
  &--h3 {
    background: var(--color-cat-4);
  }
  &--h4 {
    background: var(--color-cat-7);
  }
}

.toc-text {
  flex: 1;
  min-width: 0;
  font-size: $font-size-small;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: text;
}

.toc-edit-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--color-primary);
  border-radius: $radius-sm;
  padding: 2px 6px;
  font-size: $font-size-small;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-bg-card);
  outline: none;
}

.toc-remove {
  flex-shrink: 0;
}

.toc-empty {
  margin: 0;
  font-size: $font-size-small;
  color: var(--color-text-placeholder);
  text-align: center;
  line-height: 1.8;
}
</style>
