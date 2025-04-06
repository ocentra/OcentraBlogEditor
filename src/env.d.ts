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

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  values(): AsyncIterableIterator<FileSystemHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
} 