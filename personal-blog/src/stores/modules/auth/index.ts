import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { login } from "@/services/api/auth";
import { ElMessage } from "element-plus";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || undefined);
    const isLogin = computed(() => Boolean(token.value));
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

    const setLocalToken = (newToken: string) => {
        localStorage.setItem("token", newToken);
        token.value = newToken;
    }

    const clearLocalToken = () => {
        localStorage.removeItem("token");
        token.value = undefined;
    }

    const userlogin = async (username: string, password: string) => {
        try{
            const response = await login({ username, password });
            setLocalToken(response.access_token);
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

    return {
        // Define your state, actions, and getters here
        token,
        isLogin,
        uid,
        setLocalToken,
        clearLocalToken,
        userlogin,
    };
})