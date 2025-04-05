import { StorageAdapter } from '../adapters/StorageAdapter';
import { IndexedDBStorageAdapter } from '../adapters/IndexedDBStorageAdapter';
import { SyncManager } from '../services/SyncManager';

export const storageService = new SyncManager();
const indexedDBAdapter = new IndexedDBStorageAdapter();

storageService.addAdapter(indexedDBAdapter);

interface StorageConfig {
    useIndexedDB?: boolean;
    useGitHub?: boolean;
    githubConfig?: {
        owner: string;
        repo: string;
        branch?: string;
        token: string;
        basePath?: string;
        imageBasePath?: string;
    };
}

export function initializeStorage(config: StorageConfig = {}): SyncManager {
    const syncManager = new SyncManager();
    
    if (config.useIndexedDB !== false) {
        const indexedDBAdapter = new IndexedDBStorageAdapter();
        syncManager.addAdapter(indexedDBAdapter);
    }
    
    // GitHub adapter can be added later when implemented
    if (config.useGitHub && config.githubConfig) {
        // TODO: Add GitHub adapter when implemented
        console.warn('GitHub storage adapter not yet implemented');
    }
    
    return syncManager;
} 