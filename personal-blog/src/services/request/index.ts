import axios from "axios";
import router from "@/router";
import { useAuthStore } from "@/stores/modules/auth";
import { ElMessage } from "element-plus";

let isRefreshingToken: boolean = false; // 标记是否正在刷新 token
// let isOnece: boolean = false; // 标记是否已经刷新过一次 token
let refreshPromise: Promise<void> | null = null; // 存储刷新 token 的 Promise
// let originalRequestQueue: Array<() => void> = []; // 存储原始请求的队列

const request = axios.create({
  baseURL: import.meta.env.VITE_BFF_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const authStore = useAuthStore();
    if (authStore.isLogin) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data;
  },
  async (error) => {
    // 对响应错误做点什么
    const authStore = useAuthStore();
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      // 处理未授权错误
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        refreshPromise = authStore.refreshUserToken().finally(() => {
          isRefreshingToken = false;
          refreshPromise = null; // 清空刷新 token 的 Promise
        });
        // return request(originalRequest);
      }
        // 如果正在刷新 token，则等待刷新完成后再重试原始请求
        await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
        return request(originalRequest);
    }
    if (error.response?.status === 403) {
      // 处理禁止访问错误
      // router.push("/403");
      return Promise.reject(new Error("您没有权限访问该资源，请联系管理员。"));
    }
    if (error.response?.status === 400) {
      // 处理请求错误
      return Promise.reject(new Error("请求错误，请检查请求参数。"));
    }
    return Promise.reject(error);
  }
);

// 告知 TS 响应拦截器已解包:直接将导出实例重铸为返回裸 Promise<T> 的类型
type Unwrapped = {
  // 调用签名: request(config) 等同于 request.request(config)
  <T = any>(config: any): Promise<T>;
  request<T = any>(config: any): Promise<T>;
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
};

export default request as unknown as Unwrapped;
