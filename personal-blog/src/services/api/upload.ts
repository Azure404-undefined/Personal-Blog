import request from '@/services/request'
import { compressImage } from '@/utils/image'

const BFF = import.meta.env.VITE_BFF_URL

/**
 * 上传图片到 CloudBase Storage
 * 前端 Canvas 压缩 → base64 → BFF → CloudBase Storage
 * 返回的 url 经过 BFF 代理 (/blog-bff/files/...)，每次访问自动换新鲜 CDN 链接
 */
export const uploadImage = async (file: File) => {
  const compressed = await compressImage(file)

  const res = await request<API.Upload.UploadResponse>({
    url: '/upload',
    method: 'POST',
    data: {
      filename: compressed.filename,
      data: compressed.data,
    },
  })

  return {
    url: BFF + res.url,
    fileID: res.fileID,
  }
}
