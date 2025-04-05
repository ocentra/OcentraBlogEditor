import { StorageAdapter } from '../adapters/StorageAdapter';
import { BlogPost } from '../types/interfaces';
import FileManager from './FileManager';

export class SyncManager {
  private static instance: SyncManager;
  private adapters: StorageAdapter[] = [];
  private fileManager: FileManager;
  private syncInProgress: boolean = false;

  private constructor() {
    this.fileManager = FileManager.getInstance();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public addAdapter(adapter: StorageAdapter): void {
    this.adapters.push(adapter);
  }

  public async save(post: BlogPost): Promise<string> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      // Save to all adapters
      const savePromises = this.adapters.map(adapter => adapter.save(post));
      const results = await Promise.all(savePromises);
      
      // Save to file system
      await this.fileManager.saveBlog(post);
      
      // Return the first successful ID
      return results[0];
    } finally {
      this.syncInProgress = false;
    }
  }

  public async load(id: string): Promise<BlogPost | null> {
    // Try to load from file system first
    const autoSave = await this.fileManager.getAutoSave();
    if (autoSave) {
      return autoSave;
    }
    
    // Try to load from adapters
    for (const adapter of this.adapters) {
      const post = await adapter.load(id);
      if (post) {
        return post;
      }
    }
    
    return null;
  }

  public async list(): Promise<BlogPost[]> {
    const posts = new Map<string, BlogPost>();
    
    // Get posts from all adapters
    for (const adapter of this.adapters) {
      const summaries = await adapter.list();
      for (const summary of summaries) {
        if (!posts.has(summary.id)) {
          const post = await adapter.load(summary.id);
          if (post) {
            posts.set(summary.id, post);
          }
        }
      }
    }
    
    return Array.from(posts.values());
  }

  public async delete(id: string): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      // Delete from all adapters
      const deletePromises = this.adapters.map(adapter => adapter.delete(id));
      await Promise.all(deletePromises);
      
      // Clear auto-save
      await this.fileManager.clearAutoSave();
    } finally {
      this.syncInProgress = false;
    }
  }

  public async uploadImage(file: File): Promise<string> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      // Upload to all adapters that support image upload
      const uploadPromises = this.adapters
        .filter(adapter => typeof adapter.uploadImage === 'function')
        .map(adapter => adapter.uploadImage!(file));
      const results = await Promise.all(uploadPromises);
      
      // Return the first successful URL
      return results[0];
    } finally {
      this.syncInProgress = false;
    }
  }

  public async deleteImage(url: string): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      // Delete from all adapters that support image deletion
      const deletePromises = this.adapters
        .filter(adapter => typeof adapter.deleteImage === 'function')
        .map(adapter => adapter.deleteImage!(url));
      await Promise.all(deletePromises);
    } finally {
      this.syncInProgress = false;
    }
  }

  public async sync(): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      // Get all posts from all sources
      const allPosts = await this.list();
      
      // Sync each post to all adapters
      for (const post of allPosts) {
        await this.save(post);
      }
    } finally {
      this.syncInProgress = false;
    }
  }
} 