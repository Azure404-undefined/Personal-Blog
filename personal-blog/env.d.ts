/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BFF_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'nprogress' {
  interface NProgress {
    configure(options: { showSpinner?: boolean; trickleSpeed?: number }): void
    start(): void
    done(): void
  }

  const nprogress: NProgress
  export default nprogress
}