import { StorageAdapter } from '../adapters/StorageAdapter';
import { BlogPost } from '../types/interfaces';
import FileManager from './FileManager';
import { Logger } from '../utils/logger';
import { GlobalLogger } from '../utils/globalLogger';

export class SyncManager {
  private static instance: SyncManager;
  private adapters: StorageAdapter[] = [];
  private fileManager: FileManager;
  private syncInProgress: boolean = false;
  private readonly logger = Logger.getInstance('[SyncManager]');

  private constructor() {
    this.fileManager = FileManager.getInstance();
    // Register with global logger
    GlobalLogger.enableComponent('[SyncManager]');
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public addAdapter(adapter: StorageAdapter): void {
    this.logger.info('Adding storage adapter:', adapter.constructor.name);
    this.adapters.push(adapter);
  }

  public async save(post: BlogPost): Promise<string> {
    if (this.syncInProgress) {
      this.logger.warn('Sync already in progress');
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      this.logger.info('Saving post:', post.id);
      
      // Save to all adapters
      const savePromises = this.adapters.map(adapter => adapter.save(post));
      const results = await Promise.all(savePromises);
      
      // Save to file system
      await this.fileManager.saveBlog(post);
      
      this.logger.info('Successfully saved post:', post.id);
      // Return the first successful ID
      return results[0];
    } catch (error) {
      this.logger.error('Failed to save post:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  public async load(id: string): Promise<BlogPost | null> {
    this.logger.info('Loading post:', id);
    
    // Try to load from file system first
    const autoSave = await this.fileManager.getAutoSave();
    if (autoSave) {
      this.logger.debug('Found auto-save for post:', id);
      return autoSave;
    }
    
    // Try to load from adapters
    for (const adapter of this.adapters) {
      this.logger.debug('Trying to load from adapter:', adapter.constructor.name);
      const post = await adapter.load(id);
      if (post) {
        this.logger.info('Successfully loaded post from adapter:', adapter.constructor.name);
        return post;
      }
    }
    
    this.logger.warn('Post not found:', id);
    return null;
  }

  public async list(): Promise<BlogPost[]> {
    this.logger.info('Listing all posts');
    const posts = new Map<string, BlogPost>();
    
    // Get posts from all adapters
    for (const adapter of this.adapters) {
      this.logger.debug('Listing posts from adapter:', adapter.constructor.name);
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
    
    this.logger.info('Found posts:', posts.size);
    return Array.from(posts.values());
  }

  public async delete(id: string): Promise<void> {
    if (this.syncInProgress) {
      this.logger.warn('Sync already in progress');
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      this.logger.info('Deleting post:', id);
      
      // Delete from all adapters
      const deletePromises = this.adapters.map(adapter => adapter.delete(id));
      await Promise.all(deletePromises);
      
      // Clear auto-save
      await this.fileManager.clearAutoSave();
      
      this.logger.info('Successfully deleted post:', id);
    } catch (error) {
      this.logger.error('Failed to delete post:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  public async uploadImage(file: File): Promise<string> {
    if (this.syncInProgress) {
      this.logger.warn('Sync already in progress');
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      this.logger.info('Uploading image:', file.name);
      
      // Upload to all adapters that support image upload
      const uploadPromises = this.adapters
        .filter(adapter => typeof adapter.uploadImage === 'function')
        .map(adapter => adapter.uploadImage!(file));
      const results = await Promise.all(uploadPromises);
      
      this.logger.info('Successfully uploaded image:', file.name);
      // Return the first successful URL
      return results[0];
    } catch (error) {
      this.logger.error('Failed to upload image:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  public async deleteImage(url: string): Promise<void> {
    if (this.syncInProgress) {
      this.logger.warn('Sync already in progress');
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    try {
      this.logger.info('Deleting image:', url);
      
      // Delete from all adapters that support image deletion
      const deletePromises = this.adapters
        .filter(adapter => typeof adapter.deleteImage === 'function')
        .map(adapter => adapter.deleteImage!(url));
      await Promise.all(deletePromises);
      
      this.logger.info('Successfully deleted image:', url);
    } catch (error) {
      this.logger.error('Failed to delete image:', error);
      throw error;
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