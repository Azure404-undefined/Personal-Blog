import MarkdownIt from 'markdown-it'
import { slugify, type TocItem } from '@/utils/toc'

/**
 * 创建带锚点注入的 Markdown 渲染器
 * - 渲染时为 h2/h3/h4 注入 slugify 后的 id(重复标题加 -2/-3 后缀)
 * - extractToc 从渲染结果提取目录,与锚点同源
 */
export function createMarkdownRenderer() {
  const md = new MarkdownIt({ breaks: true, linkify: true })
  const headingIdCounts = new Map<string, number>()

  md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
    const inline = tokens[idx + 1]
    const text = inline ? inline.content : ''
    let id = slugify(text)
    const count = (headingIdCounts.get(id) || 0) + 1
    headingIdCounts.set(id, count)
    if (count > 1) id = `${id}-${count}`
    tokens[idx]?.attrSet('id', id)
    return self.renderToken(tokens, idx, options)
  }

  return {
    /** 渲染 Markdown → HTML(自动重置重复标题计数器) */
    render: (content: string): string => {
      headingIdCounts.clear()
      return md.render(content)
    },
    /** 从渲染后的 HTML 提取目录 */
    extractToc: (html: string): TocItem[] => {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const items: TocItem[] = []
      doc.querySelectorAll('h2, h3, h4').forEach((el) => {
        const anchorId = el.id
        if (anchorId) {
          items.push({ level: Number(el.tagName[1]), text: el.textContent?.trim() || '', id: anchorId })
        }
      })
      return items
    },
  }
}
