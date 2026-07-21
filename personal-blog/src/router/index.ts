import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/write',
      name: 'Write',
      component: () => import('@/views/write/index.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/my-articles',
      name: 'MyArticles',
      component: () => import('@/views/my-articles/index.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    // {
    //   path: '/*',
    //   redirect: '/',
    // }
  ],
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth) {
    if (!authStore.isLogin) {
      return {
        name: 'Login',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  } else {
    if (to.name === 'Login' && authStore.isLogin) {
      return {
        name: 'Home',
      }
    }
  }
})

export default router
