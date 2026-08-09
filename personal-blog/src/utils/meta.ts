import { onMounted, onBeforeUnmount, watchEffect, type WatchStopHandle } from 'vue'

const SITE_NAME = "Azure's Blog"

/**
 * 页面 SEO meta: 动态 title + description
 * - watchEffect 自动追踪响应式依赖(文章标题变化时自动更新)
 * - 组件卸载时恢复默认标题
 */
export function usePageMeta(title: string | (() => string), description?: string | (() => string)) {
  let stop: WatchStopHandle | undefined

  onMounted(() => {
    const getTitle = () => `${typeof title === 'function' ? title() : title} - ${SITE_NAME}`
    const getDescription = () => (typeof description === 'function' ? description() : description)

    stop = watchEffect(() => {
      document.title = getTitle()

      const desc = getDescription()
      if (!desc) return
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', desc.slice(0, 160))
    })
  })

  onBeforeUnmount(() => {
    stop?.()
    document.title = SITE_NAME
  })
}
