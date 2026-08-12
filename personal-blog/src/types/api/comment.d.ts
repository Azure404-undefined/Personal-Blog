declare namespace API {
  namespace Comments {
    interface Comment {
      _id: string
      articleId: string
      content: string
      authorUid: string
      author: string
      authorAvatar?: string
      replyToAuthor?: string | null
      parentId: string | null
      createdAt: number
      updatedAt: number
    }

    interface CreateCommentParams {
      content: string
      parentId?: string | null
      author: string
      authorAvatar?: string
      replyToAuthor?: string | null
    }

    interface CommentListResponse {
      records: Comment[]
      total: number
    }

    interface TreeComment extends Comment {
      replies: Comment[]
    }
  }
}
