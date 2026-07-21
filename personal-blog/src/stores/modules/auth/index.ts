import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { login } from "@/services/api/auth";
import { ElMessage } from "element-plus";

export const useAuthStore = defineStore("auth", () => {
    const token = ref(localStorage.getItem("token") || undefined);
    const isLogin = computed(() => Boolean(token.value));

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
            ElMessage.error("登录失败，请检查用户名和密码。");
            throw error;
        }
    };

    return {
        // Define your state, actions, and getters here
        token,
        isLogin,
        setLocalToken,
        clearLocalToken,
        userlogin,
    };
})