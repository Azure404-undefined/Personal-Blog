/**
 * 格式化时间戳为日期字符串
 * @param ts 毫秒时间戳
 * @param withTime 是否附加时间 (HH:mm)
 */
export function fmtDate(ts: number, withTime = false): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (withTime) return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return date
}

export interface YearGroup {
  year: number
  months: { month: number; articles: API.Articles.Article[] }[]
}

/** 文章按年/月分组,时间降序 */
export function groupArticlesByYearMonth(articles: API.Articles.Article[]): YearGroup[] {
  const years = new Map<number, Map<number, API.Articles.Article[]>>()
  for (const a of articles) {
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
}
