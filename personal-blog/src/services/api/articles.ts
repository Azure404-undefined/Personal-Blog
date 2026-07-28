// 文章API
import request from "@/services/request";

export const getArticles = (params: API.Articles.getArticleParams) => {
  return request<API.Articles.getArticleResponse>({
    url: "/articles",
    method: "GET",
    params,
  });
}

export const getMyArticles = (params: API.Articles.getArticleParams) => {
  return request<API.Articles.getArticleResponse>({
    url: "/articles",
    method: "GET",
    params: {
      ...params,
      mine: true,
    },
  });
}

export const getArticleById = (id: string) => {
  return request<API.Articles.Article>({
    url: `/articles/${id}`,
    method: "GET",
  });
}

export const createArticle = (data: API.Articles.createArticleParams) => {
  return request<{id: string}>({
    url: "/articles",
    method: "POST",
    data,
  });
}

export const updateArticle = (id: string, data: API.Articles.updateArticleParams) => {
  return request<{count: number}>({
    url: `/articles/${id}`,
    method: "PATCH",
    data,
  });
}

export const getCategories = () => {
  return request<string[]>({
    url: "/categories",
    method: "GET",
  });
}

export const deleteArticle = (id: string) => {
  return request<{ok: boolean}>({
    url: `/articles/${id}`,
    method: "DELETE",
  });
}
