<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { PictureFilled, Delete } from '@element-plus/icons-vue'
import { uploadImage } from '@/services/api/upload'

defineOptions({ name: 'CoverUploader' })

defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const triggerPicker = () => inputRef.value?.click()

const handleChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    error.value = '封面图片不能超过 5MB'
    ElMessage.error('封面图片不能超过 5MB')
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const res = await uploadImage(file)
    emit('update:modelValue', res.url)
    ElMessage.success('封面上传成功')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '封面上传失败'
    error.value = msg
    ElMessage.error(msg)
  } finally {
    uploading.value = false
  }
  ;(e.target as HTMLInputElement).value = ''
}

const remove = () => emit('update:modelValue', '')
</script>

<template>
  <div class="cover-uploader">
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleChange"
    />
    <div v-if="!modelValue" class="cover-placeholder" @click="triggerPicker">
      <span class="placeholder-icon"><el-icon :size="24"><PictureFilled /></el-icon></span>
      <span>{{ uploading ? '上传中...' : '点击上传封面' }}</span>
      <span class="placeholder-hint">支持 JPG / PNG / WebP，最大 5MB</span>
    </div>
    <div v-else class="cover-preview" @click="triggerPicker">
      <img :src="modelValue" alt="封面预览" />
      <div class="cover-preview-overlay">
        <el-button size="small" circle type="danger" @click.stop="remove">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <span v-if="error" class="cover-error">{{ error }}</span>
  </div>
</template>

<style lang="scss" scoped>
.cover-uploader {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 120px;
  border: 2px dashed var(--color-border);
  border-radius: $radius-md;
  cursor: pointer;
  color: var(--color-text-muted);
  background: linear-gradient(to bottom, var(--color-bg-page), var(--color-bg-card));
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
  font-size: 13px;

  .placeholder-icon {
    font-size: 24px;
    color: var(--color-primary);
    margin-bottom: 2px;
  }

  .placeholder-hint {
    font-size: 11px;
    color: var(--color-text-placeholder);
  }

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: linear-gradient(to bottom, var(--color-primary-bg), var(--color-bg-card));
  }
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;

  img {
    @include cover-img;
  }

  &-overlay {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover &-overlay {
    opacity: 1;
  }
}

.cover-error {
  display: inline-block;
  font-size: $font-size-small;
  color: var(--color-danger);
}
</style>
