import type { AxiosProgressEvent } from 'axios'
import request from '@/services/request'
import { compressImage } from '@/utils/image'
import { BFF } from '@/utils/env'

/**
 * 上传图片到 CloudBase Storage
 * 前端 Canvas 压缩 → base64 → BFF → CloudBase Storage
 * onProgress 回调收到第一段(浏览器→BFF)真实进度, 上限 99(请求体发完后 BFF 仍在处理)
 */
export const uploadImage = async (file: File, onProgress?: (percent: number) => void) => {
  const compressed = await compressImage(file)

  const res = await request<API.Upload.UploadResponse>({
    url: '/upload',
    method: 'POST',
    data: {
      filename: compressed.filename,
      data: compressed.data,
    },
    onUploadProgress: (e: AxiosProgressEvent) => {
      if (e.total && onProgress) {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
      }
    },
  })

  return {
    url: BFF + res.url,
    fileID: res.fileID,
  }
}
