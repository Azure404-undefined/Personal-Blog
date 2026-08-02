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
