import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

import '@/styles/variables.css'
import '@/styles/reset.scss'

import App from './App.vue'
import router from './router'

// 滚动位置由 Vue Router 的 scrollBehavior 接管,禁用浏览器原生恢复避免两者竞争
history.scrollRestoration = 'manual'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
