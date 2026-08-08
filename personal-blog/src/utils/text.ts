/** 从 Markdown 原文提取纯文本摘要 */
export function excerpt(md: string, max = 120): string {
  const text = md
    .replace(/[#*>`[\]()!_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? text.slice(0, max) + '...' : text
}
