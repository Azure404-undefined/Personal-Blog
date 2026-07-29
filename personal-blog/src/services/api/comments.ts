import request from '@/services/request';

export const getComments = (articleId: string) => {
  return request<API.Comments.CommentListResponse>({
    url: `/articles/${articleId}/comments`,
    method: 'GET',
  });
};

export const createComment = (articleId: string, data: API.Comments.CreateCommentParams) => {
  return request<{ id: string }>({
    url: `/articles/${articleId}/comments`,
    method: 'POST',
    data,
  });
};

export const deleteComment = (id: string) => {
  return request<{ ok: boolean }>({
    url: `/comments/${id}`,
    method: 'DELETE',
  });
};
