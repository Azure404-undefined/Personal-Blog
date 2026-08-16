# Personal Blog

A full-featured personal blog built with Vue 3 + TypeScript, powered by Tencent CloudBase (BFF cloud function + data models).

**Live demo**: https://your-blog-domain.example (TODO: replace with deployed URL)

## Architecture

```
Browser (Vue3 SPA, hand-written axios)
  │  REST + JWT (Authorization: Bearer)
  ▼
CloudBase HTTP Gateway  (path: /blog-bff)
  ▼
Cloud Function: blog-bff  (Node.js, @cloudbase/node-sdk)
  │  auth proxy / ownerUid ownership checks / CORS
  ▼
CloudBase Data Models: articles · comments
```

- **BFF pattern**: the frontend only talks to the cloud function, never to data models directly. The function manages CORS (free-tier security-domain whitelist workaround) and enforces ownership (`ownerUid`) on every write.
- **Auth**: login proxies to CloudBase Auth (`/auth/v1/signin`), JWT `sub` is used as uid. Dual-token refresh via `/auth/refresh`.
- **Config**: the envId is injected via environment variables (`ENV_ID`, with cloud-runtime auto-detection as fallback), never hardcoded in code.

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | Vue 3.5 · Vite 8 · TypeScript · Pinia · Vue Router · axios · Element Plus · markdown-it + DOMPurify · SCSS |
| Backend (BFF) | Node.js · @cloudbase/node-sdk · CloudBase HTTP Gateway |
| Tooling | ESLint + oxlint · Prettier · vue-tsc |

## Features

- **Auth**: login modal / login page, JWT dual-token, 401 auto-refresh with retry queue (concurrent requests share a single refresh call)
- **Articles**: Markdown editor with preview, cover upload & client-side compression, category / draft / published states, archive, personal article management
- **Comments**: nested threads, @-reply, collapse
- **Search**: ⌘K-style modal with debounced input and keyboard navigation
- **Security**: DOMPurify-sanitized Markdown rendering, lazy-loaded images, login rate limiting (per-IP fail window)
- **UX**: dark theme, responsive mobile layout, SEO meta per page

## Hand-written Core Modules

- `personal-blog/src/services/request/` — axios instance: token injection, 401 refresh retry queue, `Unwrapped` type system that re-types axios methods to return bare response bodies
- `personal-blog/src/router/` — route guards (`meta.requiresAuth`) and auth store integration
- `personal-blog/src/stores/` — Pinia stores (auth token/refresh lifecycle, app-level UI state)
- `personal-blog/src/types/api/` — global API type declarations
- Components: `CommentSection`, `SearchModal`, `LoginModal`, `safeContent`, cover upload, pagination, etc.

## Project Structure

```
├── personal-blog/            # Vue3 + Vite frontend
│   └── src/
│       ├── services/         # axios instance + API functions (auth/articles/comments/upload)
│       ├── stores/           # Pinia stores (auth, app UI state)
│       ├── router/           # routes + auth guard
│       ├── types/api/        # API type declarations
│       ├── components/       # shared components
│       ├── views/            # home, article-detail, write, my-articles, archive, about, categories, friends, login
│       ├── utils/            # date/image/avatar helpers
│       └── styles/           # design tokens (SCSS + CSS variables + mixins)
└── cloudfunctions/blog-bff/  # BFF cloud function (Event type)
    ├── index.js              # exports.main(event) → {statusCode, headers, body}
    └── package.json          # depends on @cloudbase/node-sdk
```

## Getting Started

### Frontend

```bash
cd personal-blog
cp .env.example .env          # fill in your CloudBase env values
npm install
npm run dev                   # Vite dev server on port 3000
```

### BFF (requires @cloudbase/cli and CloudBase env)

```bash
cp cloudbaserc.example.json cloudbaserc.json   # fill in your envId
echo y | cloudbase functions:deploy blog-bff --force
```

Configure the HTTP Gateway route `/blog-bff` in the CloudBase console.

## License

MIT
