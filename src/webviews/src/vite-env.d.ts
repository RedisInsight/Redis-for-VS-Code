/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RI_BASE_API_URL: string
  readonly RI_API_PREFIX: string
  readonly RI_API_PORT: number
  readonly RI_SCAN_TREE_COUNT: number
  readonly RI_INSTANCE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
