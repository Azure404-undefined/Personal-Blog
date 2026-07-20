import request from "@/services/request";

export const login = (data: API.Auth.LoginParams) => {
  return request<API.Auth.LoginResponse>({
    url: "/auth/login",
    method: "POST",
    data,
  });
}
