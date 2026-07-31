declare namespace API {
  namespace Articles {
    interface Article {
      _id: string
      title: string
      content: string
      category?: string
      coverImage?: string
      ownerUid: string
      createdAt: number
      updatedAt: number
      owner: string
      _openid: string
      createBy: string
      updateBy: string
    }

    interface getArticleResponse {
      records: Article[]
      page: number
      pageSize: number
      total: number
    }

    interface getArticleParams {
      page: number
      pageSize: number
      category?: string
      q?: string
    }

    interface createArticleParams {
      title: string
      content: string
      category?: string
      coverImage?: string
    }

    interface updateArticleParams {
      title?: string
      content?: string
      category?: string
      coverImage?: string
    }
  }
}
