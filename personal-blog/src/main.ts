import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 以下组件由 JS 命令式调用,auto-import 不会加载样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// 全局设计 Token & Reset
import '@/styles/variables.css'
import '@/styles/reset.scss'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
