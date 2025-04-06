import { StorageAdapter, BlogPostSummary } from './StorageAdapter';
import { BlogPost } from '../types/interfaces';
import { validateAndConvertBlogPost, validateBlogPost, ValidationError } from '../utils/typeValidator';
import { Logger } from '../utils/logger';
import { GlobalLogger } from '../utils/globalLogger';

export class IndexedDBStorageAdapter implements StorageAdapter {
  private readonly DB_NAME = 'OcentraBlogDB';
  private readonly DB_VERSION = 1;
  private readonly POSTS_STORE = 'posts';
  private readonly IMAGES_STORE = 'images';
  private db: IDBDatabase | null = null;
  private readonly logger = Logger.getInstance('[IndexedDBStorageAdapter]');

  constructor() {
    this.initDB();
    // Register with global logger
    GlobalLogger.enableComponent('[IndexedDBStorageAdapter]');
  }

  private initDB(): void {
    this.logger.info('Initializing IndexedDB');
    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      this.logger.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event) => {
      this.logger.info('Successfully opened IndexedDB');
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onupgradeneeded = (event) => {
      this.logger.info('Upgrading IndexedDB schema');
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(this.POSTS_STORE)) {
        const store = db.createObjectStore(this.POSTS_STORE, { keyPath: 'id' });
        store.createIndex('date', 'metadata.date', { unique: false });
        store.createIndex('status', 'metadata.status', { unique: false });
        this.logger.debug('Created posts store with indices');
      }
      
      if (!db.objectStoreNames.contains(this.IMAGES_STORE)) {
        db.createObjectStore(this.IMAGES_STORE, { keyPath: 'id' });
        this.logger.debug('Created images store');
      }
    };
  }

  private async withTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      this.logger.error('Database not initialized');
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve(operation(store));
      transaction.onerror = () => {
        this.logger.error('Transaction error:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async save(post: BlogPost): Promise<string> {
    this.logger.info('Saving post to IndexedDB:', post.id);
    const postId = post.id || crypto.randomUUID();
    const postToSave = { ...post, id: postId, $type: 'BlogPost' };

    try {
      validateBlogPost(postToSave);
      
      await this.withTransaction(this.POSTS_STORE, 'readwrite', async (store) => {
        await store.put(postToSave);
      });
      
      this.logger.info('Successfully saved post:', postId);
      return postId;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.error('Validation error saving post:', error.message);
      } else {
        this.logger.error('Error saving post:', error);
      }
      throw error;
    }
  }

  async load(id: string): Promise<BlogPost | null> {
    this.logger.info('Loading post from IndexedDB:', id);
    try {
      const post = await this.withTransaction<BlogPost | null>(this.POSTS_STORE, 'readonly', async (store) => {
        const request = store.get(id);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
      if (post) {
        this.logger.info('Successfully loaded post:', id);
      } else {
        this.logger.debug('Post not found:', id);
      }
      return post;
    } catch (error) {
      this.logger.error('Failed to load post:', error);
      return null;
    }
  }

  async list(): Promise<BlogPostSummary[]> {
    this.logger.info('Listing all posts from IndexedDB');
    try {
      const posts = await this.withTransaction<BlogPost[]>(this.POSTS_STORE, 'readonly', async (store) => {
        const request = store.getAll();
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
      this.logger.info('Found posts:', posts.length);
      return posts.map(post => ({
        id: post.id,
        title: post.metadata.title,
        date: post.metadata.date,
        status: post.metadata.status
      }));
    } catch (error) {
      this.logger.error('Failed to list posts:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting post from IndexedDB:', id);
    try {
      await this.withTransaction(this.POSTS_STORE, 'readwrite', async (store) => {
        await store.delete(id);
      });
      this.logger.info('Successfully deleted post:', id);
    } catch (error) {
      this.logger.error('Failed to delete post:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    this.logger.info('Uploading image to IndexedDB:', file.name);
    const imageId = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      await this.withTransaction(this.IMAGES_STORE, 'readwrite', async (store) => {
        await store.put({
          id: imageId,
          data: arrayBuffer,
          name: file.name,
          type: file.type
        });
      });
      
      this.logger.info('Successfully uploaded image:', file.name);
      return `indexeddb://${imageId}`;
    } catch (error) {
      this.logger.error('Failed to upload image:', error);
      throw error;
    }
  }

  async deleteImage(url: string): Promise<void> {
    this.logger.info('Deleting image from IndexedDB:', url);
    const imageId = url.split('://')[1];
    try {
      await this.withTransaction(this.IMAGES_STORE, 'readwrite', async (store) => {
        await store.delete(imageId);
      });
      this.logger.info('Successfully deleted image:', imageId);
    } catch (error) {
      this.logger.error('Failed to delete image:', error);
      throw error;
    }
  }
} 