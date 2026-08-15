import request from '@/services/request'
import { compressImage } from '@/utils/image'
import { BFF } from '@/utils/env'

/**
 * 上传图片到 CloudBase Storage
 * 前端 Canvas 压缩 → base64 → BFF → CloudBase Storage
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
