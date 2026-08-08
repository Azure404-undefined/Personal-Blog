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
      path: '/articles/:id',
      name: 'ArticleDetail',
      component: () => import('@/views/article-detail/index.vue'),
      meta: {
        requiresAuth: false,
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
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/about/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('@/views/categories/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/archive',
      name: 'Archive',
      component: () => import('@/views/archive/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/friends',
      name: 'Friends',
      component: () => import('@/views/friends/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/not-found/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
  ],
})

router.beforeEach((to, _from) => {
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
