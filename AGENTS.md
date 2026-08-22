# Personal Blog 项目协作说明

本文件是本地开发代理的项目上下文。它位于仓库根目录，已提交进版本控制、公开可见；不要把真实环境值写进本文件。

## 项目定位

这是一个以 Vue 3 单页应用为前端、腾讯云开发 CloudBase 为后端的个人博客。前端是 personal-blog/，后端是 cloudfunctions/blog-bff/ 中的 Node.js Event 云函数。浏览器只请求 BFF，不直接访问 CloudBase 数据模型或存储。

整体链路如下：

浏览器 Vue 3 SPA → CloudBase HTTP Gateway（路由 /blog-bff）→ blog-bff 云函数 → CloudBase Data Models（articles、comments、friends）及 Storage。

## 技术栈与运行环境

- 前端：Vue 3、TypeScript、Vite、Vue Router、Pinia、Axios、Element Plus、SCSS。
- 内容：Markdown-it 渲染，DOMPurify 清洗，工具函数负责目录、摘要和元信息。
- 后端：Node.js CommonJS Event Function、@cloudbase/node-sdk、原生 https。
- 工具：vue-tsc、ESLint、oxlint、Prettier、Sass。
- Node.js：按 personal-blog/package.json 的 engines 使用 Node 22.18+ 或 Node 24.12+；不要为适配旧 Node 随意降级依赖。
- 包管理：前端和云函数各自有 package.json 与 lockfile，分别在各自目录安装依赖。

## 目录地图

- personal-blog/src/main.ts、App.vue：应用入口和根组件。
- personal-blog/src/layout/：AppLayout、头部、页脚、搜索、登录弹窗、回到顶部。
- personal-blog/src/views/：首页、登录、写作、我的文章、文章详情、归档、分类、友链、关于、404。
- personal-blog/src/components/：文章时间线、Hero、登录表单、安全内容渲染等可复用组件。
- personal-blog/src/router/index.ts：路由和 meta.requiresAuth 登录守卫；写作和我的文章需要登录。
- personal-blog/src/stores/modules/auth/：访问令牌、刷新令牌、用户名、JWT sub uid 和登录生命周期。
- personal-blog/src/stores/modules/app/：移动菜单、主题、头部可见性、登录和搜索弹窗状态。
- personal-blog/src/services/request/：Axios 实例、Bearer 注入、401 刷新及重试队列、响应解包类型。
- personal-blog/src/services/api/：认证、文章、评论、友链、图片上传 API 封装。
- personal-blog/src/types/api/：全局 API 类型声明（API.Auth、API.Articles、API.Comments、API.Friends、API.Upload）。
- personal-blog/src/styles/：tokens.scss 设计令牌、variables.css CSS 变量、mixins.scss 混入、全局重置。
- personal-blog/src/utils/：环境变量、日期、图片压缩、头像、Markdown、目录、文本和页面元信息。
- cloudfunctions/blog-bff/index.js：BFF 路由、认证代理、模型读写、权限和文件代理。
- cloudfunctions/blog-bff/rate-limit.js：云函数实例内按 IP 的登录失败限流。
- cloudbaserc.example.json：CloudBase 部署配置模板；实际的 cloudbaserc.json 含环境信息并被忽略。

## 前端开发

所有前端命令在 personal-blog/ 执行：

npm install
npm run dev          Vite 开发服务器，默认端口 3000
npm run type-check   vue-tsc --build
npm run build        类型检查后执行生产构建
npm run lint         oxlint 和 ESLint（脚本会按配置自动修复）
npm run format       仅格式化 src/
npm run preview      预览生产构建

环境变量放在 personal-blog/.env，从 .env.example 复制后填写：

- VITE_BFF_URL：CloudBase HTTP Gateway 的 BFF 地址。
- VITE_ENV_ID：CloudBase 环境 ID。

.env、dist/、node_modules/ 和构建缓存已由前端 .gitignore 排除；不要把真实环境值写入源码、README 或示例文件。

## BFF 云函数

云函数是 Event 类型，入口为 exports.main(event)，输入约定如下：

- event.httpMethod：HTTP 方法。
- event.path：Gateway 路由前缀已剥离后的路径，不包含 /blog-bff。
- event.headers：认证和转发头。
- event.queryStringParameters：查询参数。
- event.body：JSON 字符串。

返回值必须是 { statusCode, headers, body }，JSON 响应使用 reply() 统一写入 CORS 和 Content-Type。认证从 Authorization: Bearer <JWT> 的 payload 读取 sub；兼容 x-userid。写操作必须先 requireUid()，再通过 ownerUid 或作者字段做资源归属校验。

当前路由：

- POST /auth/login：代理 CloudBase 登录，并按来源 IP 记录失败次数。
- POST /auth/refresh：代理 refresh token 换取新 token。
- GET /articles：公开文章列表；mine=true 时只返回当前用户文章（包含草稿），支持 page、pageSize、category、q。
- GET /articles/:id：文章详情；草稿仅作者可见。
- POST /articles、PATCH /articles/:id、DELETE /articles/:id：文章增删改，仅登录用户且仅作者可修改或删除。
- GET /categories：从文章数据生成分类列表。
- GET /articles/:id/comments、POST /articles/:id/comments、DELETE /comments/:id：评论列表、新增和作者删除。
- GET /friends、POST /friends、DELETE /friends/:id：友链公开读取、登录新增、创建者删除。
- POST /upload：登录后接收前端压缩后的 base64 图片并上传 CloudBase Storage。
- GET /files/:fileID：把 CloudBase fileID 转成临时 CDN URL 并返回 302。
- GET /ping：健康检查。
- OPTIONS：CORS 预检。

CloudBase SDK 的已知约定：

- models.<collection>.list() 返回 data.records 和 data.total；详情也用 list() 按 _id 过滤，不依赖 models.get()。
- create() 返回 data.id，update() 返回 data.count，删除成功可无数据返回。
- Storage 使用 app.uploadFile({ cloudPath, fileContent }) 和 app.getTempFileURL({ fileList })，不额外引入 @cloudbase/storage。
- 运行时优先读取 ENV_ID，其次读取 TCB_ENV；云函数内部没有参数时由 CloudBase 自动识别环境。

从仓库根目录部署 BFF：

echo y | cloudbase functions:deploy blog-bff --force

部署前确认 cloudbaserc.json 的环境 ID 和函数配置正确，并在 CloudBase 控制台配置 HTTP Gateway 的 /blog-bff 路由。不要把真实环境配置提交到仓库。

## 实现约定与常见陷阱

- Axios 响应拦截器已经返回 response.data；API 方法返回的是裸数据，不要再写 .data。
- Unwrapped 类型是为上述响应解包定制的类型重铸；新增 API 时沿用该实例和 API.* 类型声明。
- useAuthStore() 只能在 Pinia 已安装后的路由守卫、拦截器或组件上下文中调用，不能在模块顶层提前执行。
- isLogin 是基于 token.value 的 computed；判断时使用 authStore.isLogin，不要把 ref 对象本身转换为 Boolean。
- JWT 的 sub 是 uid；文章、评论、友链写操作要保持前后端字段和所有权检查一致。
- 上传链路是浏览器 Canvas 压缩 → base64 → BFF；后端当前限制数据串长度约 100 KB，修改限制时同步更新前端压缩逻辑和错误提示。
- Markdown 展示必须经过 safeContent.vue 的清洗流程；不要直接把未经清洗的内容交给 v-html。
- 样式优先使用 styles/tokens.scss、variables.css 和 mixins.scss 的令牌；新增页面不要散落硬编码颜色、间距或断点。
- 修改路由、API 字段或 BFF 路由时，同步更新对应类型声明、调用方和 README/部署说明。

## 修改与验证流程

1. 先阅读相关 view、store、API 类型和 BFF 路由，确认数据流再改代码。
2. 小步修改，保持现有 Vue 组合式 API、Pinia 模块结构和路径别名 @/。
3. 前端改动后至少执行 npm run type-check；涉及构建配置或发布前执行 npm run build，样式/规范改动执行 npm run lint。
4. 云函数改动后检查 CommonJS 语法、Event 返回结构、CORS、认证和 ownerUid 权限分支；能用 GET /ping 做最小连通性检查。
5. 不创建备份文件、临时副本或测试痕迹；不要提交 node_modules、dist、.env、真实 CloudBase 配置或其他生成物。

## Git 约定

- 根目录 AGENTS.md 是项目协作说明，已加入版本控制、公开可见；其中不得出现真实环境值。
- CLAUDE.md、.claude/、.superpowers/、docs/ 和真实 cloudbaserc.json 按现有忽略规则处理。
- 修改前先查看 git status --short；只提交本次任务明确涉及的源文件，不要顺手清理或覆盖其他未提交改动。
