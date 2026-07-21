# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

```
Browser (hand-written axios)
  → CloudBase HTTP Gateway (控制台配路由, path /blog-bff)
    → Cloud Function blog-bff (Event type, Node.js)
      → CloudBase Data Model `articles` (node-sdk)
```

- **BFF pattern**: 前端只打云函数,不直连数据模型。函数自控 CORS 绕开免费版安全域名白名单限制。
- **Auth**: `/auth/login` 代理到 `https://<envId>.api.tcloudbasegateway.com/auth/v1/signin`,JWT `sub` 字段作为 uid。写操作手动判 `ownerUid` 所有权(内置权限对云函数不生效)。
- **前端核心由用户手写**(axios 拦截器/Pinia store/路由守卫/页面);AI 写 BFF 云函数并 review 前端。

## Project Structure

```
cloudfunctions/blog-bff/     # BFF cloud function (deployed via CLI)
  index.js                   # Event function — exports.main(event) → {statusCode, headers, body}
  package.json               # depends on @cloudbase/node-sdk

personal-blog/               # Vue3 + Vite frontend
  src/
    services/request/        # Axios instance with interceptors (token injection, error handling)
    services/api/            # API functions — auth.ts, articles.ts
    stores/modules/auth/     # Pinia auth store (token, isLogin, login/logout)
    stores/modules/app/      # App-level UI state (mobile menu, responsive)
    layout/AppLayout.vue     # Root layout — header + nav + slot for router-view
    router/                  # Vue Router with beforeEach auth guard (meta.requiresAuth)
    types/api/               # API type declarations (namespace API.Auth, API.Articles)
    views/                   # Page components (home, login, write, my-articles)
```

## Commands

All frontend commands run from `personal-blog/`:

```bash
npm run dev          # Vite dev server (port 3000, auto-open)
npm run build        # Type-check + production build
npm run preview      # Preview production build
npm run lint         # oxlint + ESLint (both auto-fix)
npm run format       # Prettier format src/
```

Deploy BFF from repo root:

```bash
echo y | cloudbase functions:deploy blog-bff --force
```

## Key Technical Details

### Gateway → Function Contract
- **Format**: Event function. `event = {httpMethod, path, headers, queryStringParameters, body(string)}`
- **`event.path`** does NOT include the gateway route prefix (`/blog-bff` is stripped)
- **Return**: `{statusCode, headers, body: JSON.stringify(data)}`
- **Auth**: `x-userid` header is always empty. Decode JWT from `Authorization: Bearer <token>` → `Buffer.from(payload, 'base64url')` → `JSON.parse` → `.sub`

### Data Model API Quirks (node-sdk)
- `models.articles.list()` → `{data: {records:[], total:N}}` ✅
- `models.articles.get()` → also returns list format `{records:[], total:N}` — **use list() instead**
- `models.articles.create()` → `{data: {id:"..."}}` (note: `id`, not `_id`)
- `models.articles.update()` → `{data: {count:N}}`
- `models.articles.delete()` → succeeds silently

### Axios Type System
- Response interceptor unwraps `response.data` — API functions receive bare body
- `services/request/index.ts` exports a re-typed `Unwrapped` that tells TS methods return `Promise<T>` not `Promise<AxiosResponse<T>>`
- `useAuthStore()` must be called inside interceptor callbacks, not at module top level (Pinia must be installed first)

### Auth Store
- `token` = `ref(localStorage.getItem("token") || undefined)`
- `isLogin` = `computed(() => Boolean(token.value))` — MUST use `.value`; `Boolean(ref)` is always `true`
- Login flow: `userlogin()` → API call → `setLocalToken(response.access_token)` → localStorage + reactivity

## Environment

- **envId**: `private-project-d8ficqljdf83631a`
- **BFF URL**: `https://private-project-d8ficqljdf83631a-1440586748.ap-shanghai.app.tcloudbase.com/blog-bff`
- **Test account**: `user` / `User123456` (uid `2077346131952549890`)
- **BFF local code**: `cloudfunctions/blog-bff/index.js`
- **Frontend .env**: `personal-blog/.env` (`VITE_BFF_URL=...`)
