// 友链 API
import request from '@/services/request'

export const getFriends = () => {
  return request<API.Friends.FriendListResponse>({
    url: '/friends',
    method: 'GET',
  })
}

export const createFriend = (data: API.Friends.CreateFriendParams) => {
  return request<{ id: string }>({
    url: '/friends',
    method: 'POST',
    data,
  })
}

export const deleteFriend = (id: string) => {
  return request<{ ok: boolean }>({
    url: `/friends/${id}`,
    method: 'DELETE',
  })
}
