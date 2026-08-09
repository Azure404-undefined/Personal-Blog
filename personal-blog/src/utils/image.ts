import { BFF } from '@/utils/env'

/**
 * 封面 URL: 兼容 BFF 代理相对路径 /files/... 与绝对 http 地址
 */
export function coverUrl(cover?: string): string {
  if (!cover) return ''
  return cover.startsWith('http') ? cover : BFF + cover
}

/**
 * Canvas 压缩图片，确保 base64 不超过网关 100KB 限制
 * 策略: 降 quality (0.7→0.2) → 降分辨率 (×0.7) → 重复，底线 400px
 */
export const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.7,
): Promise<{ data: string; filename: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const origWidth = img.width
      const origHeight = img.height

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'))
        return
      }

      const tryCompress = (q: number, w: number): string => {
        const h = w < origWidth ? Math.round((origHeight * w) / origWidth) : origHeight
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)

        const dataUrl = canvas.toDataURL('image/jpeg', q)
        const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')

        if (base64.length > 95 * 1024) {
          if (q > 0.15) return tryCompress(Math.max(q - 0.1, 0.15), w)
          if (w > 400) return tryCompress(0.7, Math.floor(w * 0.7))
        }
        return base64
      }

      const w = origWidth > maxWidth ? maxWidth : origWidth
      const data = tryCompress(quality, w)
      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'

      resolve({ data, filename: name })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}
