declare namespace API {
  namespace Upload {
    interface UploadParams {
      filename: string
      data: string // base64 (compressed)
    }

    interface UploadResponse {
      url: string
      fileID: string
    }
  }
}
