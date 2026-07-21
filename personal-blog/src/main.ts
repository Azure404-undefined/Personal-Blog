import { createApp } from 'vue'
import { createPinia } from 'pinia'

// ElMessage / ElNotification 是命令式调用,auto-import 不会加载它们的样式
import 'element-plus/es/components/message/style/css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
