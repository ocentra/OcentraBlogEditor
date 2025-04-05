import { GitHubStorageAdapter } from '../adapters/GitHubStorageAdapter';
import { IndexedDBStorageAdapter } from '../adapters/IndexedDBStorageAdapter';
import { SyncManager } from '../services/SyncManager';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string;
  token: string;
  basePath?: string;
  imageBasePath?: string;
}

export function initializeStorage(githubConfig?: GitHubConfig): SyncManager {
  const syncManager = SyncManager.getInstance();
  
  // Always add IndexedDB adapter for local storage
  const indexedDBAdapter = new IndexedDBStorageAdapter();
  syncManager.addAdapter(indexedDBAdapter);
  
  // Add GitHub adapter if configured
  if (githubConfig) {
    const githubAdapter = new GitHubStorageAdapter(githubConfig);
    syncManager.addAdapter(githubAdapter);
  }
  
  return syncManager;
} 