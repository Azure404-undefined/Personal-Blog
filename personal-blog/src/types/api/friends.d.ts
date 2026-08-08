declare namespace API {
  namespace Friends {
    interface Friend {
      _id: string
      name: string
      url: string
      avatar?: string
      description?: string
      ownerUid: string
      createdAt: number
      updatedAt: number
    }

    interface FriendListResponse {
      records: Friend[]
      total: number
    }

    interface CreateFriendParams {
      name: string
      url: string
      avatar?: string
      description?: string
    }
  }
}
