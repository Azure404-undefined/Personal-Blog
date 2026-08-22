# 个人博客（Personal Blog）

基于 Vue 3 + TypeScript 的全功能个人博客，后端由腾讯 CloudBase 支撑（BFF 云函数 + 数据模型）。

**在线演示**：

- Vercel：`https://personal-blog-cjy.vercel.app`
- 腾讯云：`https://personal-blog-private-project-d8ficqljdf83631a.webapps.tcloudbase.com`

## 架构

```
浏览器（Vue3 SPA，手写 axios 层）
  │  REST + JWT（Authorization: Bearer）
  ▼
CloudBase HTTP 网关  （路由 path: /blog-bff）
  ▼
云函数 blog-bff  （Node.js，@cloudbase/node-sdk）
  │  登录代理 / ownerUid 所有权校验 / CORS
  ▼
CloudBase 数据模型：articles · comments
```

- **BFF 模式**：前端只调云函数，不直连数据模型。函数自控 CORS（绕开免费版安全域名白名单限制），所有写操作手动校验 `ownerUid` 所有权。
- **鉴权**：登录代理到 CloudBase Auth（`/auth/v1/signin`），JWT `sub` 字段作为 uid。双 token 刷新通过 `/auth/refresh`。
- **配置**：envId 通过环境变量注入（`ENV_ID`，云端自动识别兜底），不在代码中硬编码。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3.5 · Vite 8 · TypeScript · Pinia · Vue Router · axios · Element Plus · markdown-it + DOMPurify · SCSS |
| 后端（BFF） | Node.js · @cloudbase/node-sdk · CloudBase HTTP 网关 |
| 工具链 | ESLint + oxlint · Prettier · vue-tsc |

## 功能

- **鉴权**：登录弹窗 / 登录页、JWT 双 token、401 自动刷新 + 重试队列（并发请求共享单次刷新）
- **文章**：Markdown 编辑器与预览、封面上传 + 客户端压缩、分类 / 草稿 / 发布状态、归档、个人文章管理
- **评论**：嵌套回复、@提及、折叠
- **搜索**：⌘K 风格弹窗，防抖输入 + 键盘导航
- **安全**：DOMPurify 净化 Markdown 渲染、图片懒加载、登录限流（按 IP 失败窗口）
- **体验**：暗色主题、响应式移动端布局、每页 SEO meta

## 手写核心模块

- `personal-blog/src/services/request/` — axios 实例：token 注入、401 刷新重试队列、`Unwrapped` 类型系统（重写 axios 方法返回类型为裸响应体）
- `personal-blog/src/router/` — 路由守卫（`meta.requiresAuth`）+ auth store 联动
- `personal-blog/src/stores/` — Pinia store（auth token/refresh 生命周期、应用级 UI 状态）
- `personal-blog/src/types/api/` — 全局 API 类型声明
- 组件：`CommentSection`、`SearchModal`、`LoginModal`、`safeContent`、`ContactLinks`、封面上传、分页等

## 项目结构

```
├── personal-blog/            # Vue3 + Vite 前端
│   └── src/
│       ├── services/         # axios 实例 + API 函数（auth/articles/comments/upload）
│       ├── stores/           # Pinia store（auth、应用 UI 状态）
│       ├── router/           # 路由 + 鉴权守卫
│       ├── types/api/        # API 类型声明
│       ├── components/       # 共享组件
│       ├── views/            # 首页、文章详情、写文章、我的文章、归档、关于、分类、友链、登录
│       ├── utils/            # 日期/图片/头像工具
│       └── styles/           # 设计体系（SCSS tokens + CSS 变量 + mixins）
└── cloudfunctions/blog-bff/  # BFF 云函数（Event 类型）
    ├── index.js              # exports.main(event) → {statusCode, headers, body}
    ├── rate-limit.js         # 登录限流模块（按 IP 失败窗口）
    └── package.json          # 依赖 @cloudbase/node-sdk
```

## 快速开始

### 前端

```bash
cd personal-blog
cp .env.example .env          # 填入你的 CloudBase 环境配置
npm install
npm run dev                   # Vite dev server（端口 3000）
```

### BFF（需要 @cloudbase/cli 与 CloudBase 环境）

```bash
cp cloudbaserc.example.json cloudbaserc.json   # 填入你的 envId
echo y | tcb fn deploy blog-bff --force
```

在 CloudBase 控制台配置 HTTP 网关路由 `/blog-bff`。

## License

MIT
