import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { login, refreshToken } from "@/services/api/auth";
import { ElMessage } from "element-plus";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || undefined);
    const refreshTokens = ref(localStorage.getItem("refresh_token") || undefined);
    const isLogin = computed(() => Boolean(token.value));
    // const isRefreshToken = computed(() => Boolean(refreshTokens.value));
    const uid = computed(() => {
      if (!token.value) return null;
      try {
        const parts = token.value.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return String(payload.sub) || null;
      } catch { return null; }
    });

    const setLocalToken = (newToken: string,refreshToken: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("refresh_token", refreshToken);
        token.value = newToken;
        refreshTokens.value = refreshToken;
    }

    const clearLocalToken = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        token.value = undefined;
        refreshTokens.value = undefined;
    }

    const userlogin = async (username: string, password: string) => {
        try{
            const response = await login({ username, password });
            setLocalToken(response.access_token,response.refresh_token);
        } catch (error) {
            clearLocalToken();
            ElMessage({
                message: "登录失败，请检查用户名和密码。",
                type: "error",
                duration: 3000,
                placement: "top",
            });
            throw error;
        }
    };

    const refreshUserToken = async () => {
        if (!refreshTokens.value) {
            clearLocalToken();
            ElMessage({
                message: "登录失效，请重新登录。",
                type: "error",
                duration: 3000,
                placement: "top",
            });
            router.push("/login");
            throw new Error("No refresh token available");
        }
        try {
            const response = await refreshToken({ refresh_token: refreshTokens.value });
            setLocalToken(response.access_token, response.refresh_token);
        } catch (error) {
            clearLocalToken();
            ElMessage({
                message: "登录失效，请重新登录。",
                type: "error",
                duration: 3000,
                placement: "top",
            });
            router.push("/login");
            throw error;
        }
    };

    return {
        token,
        isLogin,
        uid,
        refreshUserToken,
        setLocalToken,
        clearLocalToken,
        userlogin,
        // isRefreshToken,
    };
})