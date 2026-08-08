/** 分类 → 稳定颜色(同一分类永远同色) */
const CATEGORY_COLORS: string[] = [
  'var(--color-cat-0)',
  'var(--color-cat-1)',
  'var(--color-cat-2)',
  'var(--color-cat-3)',
  'var(--color-cat-4)',
  'var(--color-cat-5)',
  'var(--color-cat-6)',
  'var(--color-cat-7)',
  'var(--color-cat-8)',
  'var(--color-cat-9)',
]

export function categoryColor(cat: string): string {
  let hash = 0
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]!
}
