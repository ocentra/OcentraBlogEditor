/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_OWNER: string
  readonly VITE_GITHUB_REPO: string
  readonly VITE_GITHUB_BRANCH: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_STORAGE_BASE_PATH: string
  readonly VITE_STORAGE_IMAGE_PATH: string
  readonly VITE_DEV_MODE: string
  readonly VITE_DEV_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 