// Add type declarations at the top of the file
interface FileSystemSaveOptions {
  suggestedName?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  getParent(): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showOpenFilePicker(options?: {
      types?: {
        description: string;
        accept: Record<string, string[]>;
      }[];
      excludeAcceptAllOption?: boolean;
      multiple?: boolean;
      startIn?: FileSystemDirectoryHandle;
    }): Promise<FileSystemHandle[]>;
    showSaveFilePicker(options?: FileSystemSaveOptions): Promise<FileSystemHandle>;
  }
}

import { BlogPost } from '../types/interfaces';
import JSZip from 'jszip';

export interface FileMetadata {
  id: string;
  path: string;
  lastModified: Date;
  lastAccessed: Date;
  name: string;
  content?: string;
}

export interface RecentFile extends FileMetadata {
  preview?: string;
  thumbnail?: string;
}

export interface SaveOptions {
  format: 'json' | 'html' | 'markdown';
  path?: string;
}

interface BlogPackage {
  content: BlogPost;
  assets: Map<string, Blob>;
  manifest: {
    version: string;
    created: string;
    lastModified: string;
    assetsList: string[];
  };
}

export default class FileManager {
  private static instance: FileManager;
  private recentFiles: RecentFile[] = [];
  private currentFileHandle: FileSystemHandle | null = null;
  private readonly MAX_RECENT_FILES = 10;
  private readonly DB_NAME = 'OcentraBlogDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'files';
  private readonly RECENT_FILES_STORE = 'recentFiles';
  private readonly AUTO_SAVE_STORE = 'autoSave';
  private readonly EXTENSION = '.ocblog';
  private readonly VERSION = '1.0.0';
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  private initDB(): void {
    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.migrateFromLocalStorage();
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        db.createObjectStore(this.STORE_NAME, { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains(this.RECENT_FILES_STORE)) {
        db.createObjectStore(this.RECENT_FILES_STORE, { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains(this.AUTO_SAVE_STORE)) {
        db.createObjectStore(this.AUTO_SAVE_STORE, { keyPath: 'id' });
      }
    };
  }

  private async migrateFromLocalStorage(): Promise<void> {
    if (!this.db) return;

    // Migrate recent files
    const savedFiles = localStorage.getItem('ocentra-recent-files');
    if (savedFiles) {
      const recentFiles = JSON.parse(savedFiles);
      const transaction = this.db.transaction([this.RECENT_FILES_STORE], 'readwrite');
      const store = transaction.objectStore(this.RECENT_FILES_STORE);
      
      for (const file of recentFiles) {
        store.put({
          ...file,
          lastModified: new Date(file.lastModified),
          lastAccessed: new Date(file.lastAccessed)
        });
      }
      
      localStorage.removeItem('ocentra-recent-files');
    }

    // Migrate auto-save
    const autoSave = localStorage.getItem('ocentra-auto-save');
    if (autoSave) {
      const transaction = this.db.transaction([this.AUTO_SAVE_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUTO_SAVE_STORE);
      store.put({ id: 'auto-save', content: autoSave });
      localStorage.removeItem('ocentra-auto-save');
    }
  }

  private async storeFileContent(path: string, content: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({ path, content });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFileContent(path: string): Promise<string | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(path);

      request.onsuccess = () => resolve(request.result?.content || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async loadRecentFiles(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECENT_FILES_STORE], 'readonly');
      const store = transaction.objectStore(this.RECENT_FILES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        this.recentFiles = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async saveRecentFiles(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.RECENT_FILES_STORE], 'readwrite');
      const store = transaction.objectStore(this.RECENT_FILES_STORE);
      
      // Clear existing files
      store.clear();
      
      // Add current files
      for (const file of this.recentFiles) {
        store.put(file);
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async addToRecentFiles(file: FileMetadata): Promise<void> {
    this.recentFiles = this.recentFiles.filter(f => f.path !== file.path);
    this.recentFiles.unshift({
      ...file,
      lastAccessed: new Date()
    });
    
    if (this.recentFiles.length > this.MAX_RECENT_FILES) {
      this.recentFiles = this.recentFiles.slice(0, this.MAX_RECENT_FILES);
    }
    
    await this.saveRecentFiles();
  }

  private async createBlogPackage(post: BlogPost, assets: Map<string, Blob> = new Map()): Promise<Blob> {
    const zip = new JSZip();
    
    // Add content - ensure we're saving the actual post data
    const postData = {
      ...post,
      metadata: { ...post.metadata },
      content: { ...post.content }
    };
    zip.file('content.json', JSON.stringify(postData, null, 2));
    
    // Add metadata
    zip.file('metadata.json', JSON.stringify(postData.metadata, null, 2));
    
    // Add assets
    const assetsFolder = zip.folder('assets');
    for (const [filename, blob] of assets.entries()) {
      assetsFolder?.file(filename, blob);
    }
    
    // Add manifest
    const manifest = {
      version: this.VERSION,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      assetsList: Array.from(assets.keys())
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    
    // Generate blob
    return await zip.generateAsync({ type: 'blob' });
  }

  private async extractBlogPackage(blob: Blob): Promise<BlogPackage> {
    const zip = await JSZip.loadAsync(blob);
    
    // Extract content
    const contentJson = await zip.file('content.json')?.async('string');
    if (!contentJson) throw new Error('Invalid blog package: missing content.json');
    const content = JSON.parse(contentJson) as BlogPost;
    
    // Extract manifest
    const manifestJson = await zip.file('manifest.json')?.async('string');
    if (!manifestJson) throw new Error('Invalid blog package: missing manifest.json');
    const manifest = JSON.parse(manifestJson);
    
    // Extract assets
    const assets = new Map<string, Blob>();
    const assetsFolder = zip.folder('assets');
    if (assetsFolder) {
      for (const filename of manifest.assetsList) {
        const file = zip.file(`assets/${filename}`);
        if (file) {
          const blob = await file.async('blob');
          assets.set(filename, blob);
        }
      }
    }
    
    return { content, assets, manifest };
  }

  public async newBlog(): Promise<BlogPost> {
    // Clear any existing file handle and auto-save
    this.currentFileHandle = null;
    this.clearAutoSave();
    
    const newPost: BlogPost = {
      id: crypto.randomUUID(),
      metadata: {
        title: 'Untitled Blog',
        author: '',
        date: new Date().toISOString(),
        category: '',
        readTime: '',
        featured: false,
        status: 'draft'
      },
      content: {
        sections: []
      }
    };

    // Don't save to localStorage initially - wait for first save
    return newPost;
  }

  public async openBlog(file?: File): Promise<BlogPost> {
    try {
      let blogPackage: BlogPackage;
      let fileName: string;
      let filePath: string;
      
      if (file) {
        blogPackage = await this.extractBlogPackage(file);
        fileName = file.name;
        filePath = file.name;
      } else {
        const pickerOpts = {
          types: [
            {
              description: 'Ocentra Blog',
              accept: {
                'application/ocblog': [this.EXTENSION]
              }
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false
        };
        
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        this.currentFileHandle = fileHandle;
        const pickedFile = await fileHandle.getFile();
        blogPackage = await this.extractBlogPackage(pickedFile);
        fileName = fileHandle.name;
        filePath = fileHandle.name;

        // Store file content in IndexedDB
        const content = await pickedFile.text();
        await this.storeFileContent(filePath, content);
      }

      // Add to recent files
      this.addToRecentFiles({
        id: blogPackage.content.id,
        path: filePath,
        lastModified: new Date(blogPackage.manifest.lastModified),
        lastAccessed: new Date(),
        name: fileName,
        content: JSON.stringify(blogPackage.content)
      });

      return blogPackage.content;
    } catch (error) {
      console.error('Error opening blog:', error);
      throw new Error('Failed to open blog file');
    }
  }

  public async openRecentFile(file: RecentFile): Promise<BlogPost> {
    try {
      // First try to get content from IndexedDB
      const storedContent = await this.getFileContent(file.path);
      
      if (storedContent) {
        // Update last accessed time
        this.addToRecentFiles({
          ...file,
          lastAccessed: new Date()
        });
        
        return JSON.parse(storedContent);
      }

      // If not in IndexedDB, open file picker
      const pickerOpts = {
        types: [
          {
            description: 'Ocentra Blog',
            accept: {
              'application/ocblog': [this.EXTENSION]
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false,
        suggestedName: file.name
      };
      
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      const pickedFile = await fileHandle.getFile();
      const blogPackage = await this.extractBlogPackage(pickedFile);
      
      // Store file content in IndexedDB
      const content = await pickedFile.text();
      await this.storeFileContent(file.path, content);
      
      // Update last accessed time
      this.addToRecentFiles({
        ...file,
        lastAccessed: new Date(),
        content: JSON.stringify(blogPackage.content)
      });
      
      return blogPackage.content;
    } catch (error) {
      console.error('Error opening recent file:', error);
      throw new Error('Failed to open recent file');
    }
  }

  public async saveBlog(post: BlogPost, options?: SaveOptions): Promise<void> {
    try {
      console.log('Saving blog post:', post); // Debug log
      
      // Create blog package with current assets
      const blogPackage = await this.createBlogPackage(post);
      const blob = blogPackage;
      
      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            if (!this.db) throw new Error('Database not initialized');
            
            const transaction = this.db.transaction([this.AUTO_SAVE_STORE], 'readwrite');
            const store = transaction.objectStore(this.AUTO_SAVE_STORE);
            await store.put({ id: 'auto-save', content: reader.result as string });
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(reader.error);
      });

      // Always prompt for save location if no file handle exists
      if (!this.currentFileHandle) {
        console.log('No file handle, prompting for save location'); // Debug log
        
        const pickerOpts = {
          suggestedName: `${post.metadata.title || 'Untitled'}${this.EXTENSION}`,
          types: [
            {
              description: 'Ocentra Blog',
              accept: {
                'application/ocblog': [this.EXTENSION]
              }
            }
          ]
        };
        
        try {
          // Show save dialog
          const fileHandle = await window.showSaveFilePicker(pickerOpts);
          this.currentFileHandle = fileHandle;
          
          // Save to the selected location
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          // Add to recent files
          this.addToRecentFiles({
            id: post.id,
            path: fileHandle.name,
            lastModified: new Date(),
            lastAccessed: new Date(),
            name: fileHandle.name,
            content: JSON.stringify(post)
          });
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // User cancelled the save dialog
            console.log('Save cancelled by user');
            return; // Don't proceed with saving if user cancelled
          } else {
            console.error('Error saving file:', error);
            throw new Error('Failed to save blog file');
          }
        }
      } else {
        // We have a file handle, save to that location
        try {
          const writable = await this.currentFileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (error) {
          console.error('Error saving to existing file:', error);
          throw new Error('Failed to save blog file');
        }
      }
    } catch (error) {
      console.error('Error in saveBlog:', error);
      throw new Error('Failed to save blog file');
    }
  }

  public async saveBlogAs(post: BlogPost): Promise<void> {
    try {
      const blogPackage = await this.createBlogPackage(post);
      const blob = blogPackage;
      
      const pickerOpts = {
        suggestedName: `${post.metadata.title || 'Untitled'}${this.EXTENSION}`,
        types: [
          {
            description: 'Ocentra Blog',
            accept: {
              'application/ocblog': [this.EXTENSION]
            }
          }
        ]
      };
      
      const fileHandle = await window.showSaveFilePicker(pickerOpts);
      this.currentFileHandle = fileHandle;
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      // Add to recent files
      this.addToRecentFiles({
        id: post.id,
        path: fileHandle.name,
        lastModified: new Date(),
        lastAccessed: new Date(),
        name: fileHandle.name,
        content: JSON.stringify(post)
      });
    } catch (error) {
      console.error('Error saving blog as:', error);
      throw new Error('Failed to save blog file');
    }
  }

  public async exportBlog(post: BlogPost): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${post.metadata.title}</title>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 { color: #333; }
              .metadata {
                color: #666;
                font-size: 0.9em;
                margin-bottom: 20px;
              }
              .content {
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <h1>${post.metadata.title}</h1>
            <div class="metadata">
              <p>Author: ${post.metadata.author}</p>
              <p>Date: ${new Date(post.metadata.date).toLocaleDateString()}</p>
              <p>Category: ${post.metadata.category}</p>
              <p>Read Time: ${post.metadata.readTime}</p>
            </div>
            <div class="content">
              ${post.content.sections.map(section => `
                <div class="section">
                  ${section.content}
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const pickerOpts = {
        suggestedName: `${post.metadata.title || 'Untitled'}.html`,
        types: [
          {
            description: 'HTML Document',
            accept: {
              'text/html': ['.html']
            }
          }
        ]
      };
      
      const fileHandle = await window.showSaveFilePicker(pickerOpts);
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      console.error('Error exporting blog:', error);
      throw new Error('Failed to export blog file');
    }
  }

  public getRecentFiles(): RecentFile[] {
    return [...this.recentFiles];
  }

  public clearRecentFiles(): void {
    this.recentFiles = [];
    this.saveRecentFiles();
  }

  public async getAutoSave(): Promise<BlogPost | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUTO_SAVE_STORE], 'readonly');
      const store = transaction.objectStore(this.AUTO_SAVE_STORE);
      const request = store.get('auto-save');

      request.onsuccess = () => {
        if (!request.result) {
          resolve(null);
          return;
        }

        try {
          const base64Data = request.result.content.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/zip' });
          this.extractBlogPackage(blob).then(pkg => resolve(pkg.content)).catch(reject);
        } catch (error) {
          reject(error);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async clearAutoSave(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUTO_SAVE_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUTO_SAVE_STORE);
      const request = store.delete('auto-save');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
} 