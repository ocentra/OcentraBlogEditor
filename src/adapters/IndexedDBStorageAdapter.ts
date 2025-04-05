import { StorageAdapter } from './StorageAdapter';
import { BlogPost } from '../types/interfaces';
import { validateAndConvertBlogPost, validateBlogPost, ValidationError } from '../utils/typeValidator';

export class IndexedDBStorageAdapter implements StorageAdapter {
  private readonly DB_NAME = 'OcentraBlogDB';
  private readonly DB_VERSION = 1;
  private readonly POSTS_STORE = 'posts';
  private readonly IMAGES_STORE = 'images';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(this.POSTS_STORE)) {
        const store = db.createObjectStore(this.POSTS_STORE, { keyPath: 'id' });
        store.createIndex('date', 'metadata.date', { unique: false });
        store.createIndex('status', 'metadata.status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(this.IMAGES_STORE)) {
        db.createObjectStore(this.IMAGES_STORE, { keyPath: 'id' });
      }
    };
  }

  private async withTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve(operation(store));
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async save(post: BlogPost): Promise<void> {
    const postToSave = { ...post, $type: 'BlogPost' };

    try {
      validateBlogPost(postToSave);
      
      await this.withTransaction(this.POSTS_STORE, 'readwrite', async (store) => {
        await store.put(postToSave);
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('Validation error saving post:', error.message);
      } else {
        console.error('Error saving post:', error);
      }
      throw error;
    }
  }

  async load(id: string): Promise<BlogPost | null> {
    try {
      return await this.withTransaction(this.POSTS_STORE, 'readonly', async (store) => {
        const request = store.get(id);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const post = request.result;
            if (!post) {
              resolve(null);
              return;
            }
            try {
              resolve(validateAndConvertBlogPost(post));
            } catch (error) {
              reject(error);
            }
          };
          request.onerror = () => reject(request.error);
        });
      });
    } catch (error) {
      console.error(`Error loading post ${id}:`, error);
      return null;
    }
  }

  async list(): Promise<BlogPost[]> {
    try {
      return await this.withTransaction(this.POSTS_STORE, 'readonly', async (store) => {
        const request = store.getAll();
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const posts = request.result;
            try {
              resolve(posts.map(post => validateAndConvertBlogPost(post)));
            } catch (error) {
              reject(error);
            }
          };
          request.onerror = () => reject(request.error);
        });
      });
    } catch (error) {
      console.error('Error listing posts:', error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.withTransaction(this.POSTS_STORE, 'readwrite', async (store) => {
        await store.delete(id);
      });
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
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
      
      return `indexeddb://${imageId}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(url: string): Promise<void> {
    const imageId = url.split('://')[1];
    try {
      await this.withTransaction(this.IMAGES_STORE, 'readwrite', async (store) => {
        await store.delete(imageId);
      });
    } catch (error) {
      console.error(`Error deleting image ${imageId}:`, error);
      throw error;
    }
  }
} 