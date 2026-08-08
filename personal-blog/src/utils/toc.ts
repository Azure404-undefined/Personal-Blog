/** 目录项 */
export interface TocItem {
  /** 标题级别: 2 | 3 | 4 */
  level: number
  text: string
  id: string
}

/** 标题文本 → 锚点 ID(保留中文/字母/数字,其余转连字符) */
export function slugify(text: string): string {
  return (
    text
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  )
}
