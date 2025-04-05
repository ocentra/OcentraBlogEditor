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
import { Logger } from '../utils/logger';
import { GlobalLogger } from '../utils/globalLogger';
import defaultPost from '../../example/content/posts/example-blog-01/post.json';

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
  private readonly logger = Logger.getInstance('[FileManager]');
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
  private readonly TEMP_DIR = 'temp';
  private readonly ASSETS_DIR = 'assets';
  private db: IDBDatabase | null = null;
  private currentPostId: string | null = null;

  private constructor() {
    this.currentFileHandle = null;
    // Register with global logger
    GlobalLogger.enableComponent('[FileManager]');
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        this.logger.error('Error opening IndexedDB:', event);
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.migrateFromLocalStorage().then(resolve).catch(reject);
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
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
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

  private async convertBase64ToBlob(base64Data: string): Promise<Blob> {
    try {
      this.logger.debug('Converting base64 to blob');
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64String = base64Data.split(',')[1];
      const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0];
      
      // Convert base64 to binary
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      this.logger.error('Failed to convert base64 to blob:', error);
      throw error;
    }
  }

  private async createBlogPackage(post: BlogPost): Promise<Blob> {
    this.logger.info('Creating blog package for post:', post.id);
    const zip = new JSZip();
    
    // Create a deep copy of the post data
    const postData = {
      ...post,
      metadata: { ...post.metadata },
      content: { ...post.content }
    };

    // Handle hero image if it exists
    if (postData.content.featuredImage?.url) {
      const mediaUrl = postData.content.featuredImage.url;
      this.logger.debug('Processing hero media:', mediaUrl.substring(0, 50) + '...');
      
      try {
        let blob: Blob | null = null;
        if (mediaUrl.startsWith('data:')) {
          this.logger.debug('Converting base64 hero media to blob');
          blob = await this.convertBase64ToBlob(mediaUrl);
        } else if (mediaUrl.startsWith('http')) {
          this.logger.debug('Downloading external hero media');
          try {
            const response = await fetch(mediaUrl);
            if (!response.ok) throw new Error('Failed to download image');
            blob = await response.blob();
          } catch (error) {
            this.logger.warn('Failed to download hero media, keeping original URL:', error);
            // Keep the original URL if download fails
            postData.content.featuredImage.url = mediaUrl;
          }
        } else {
          this.logger.debug('Loading hero media from temp');
          blob = await this.loadAssetFromTemp(mediaUrl);
        }

        if (blob) {
          const filename = `hero-media-${Date.now()}.${blob.type.split('/')[1]}`;
          this.logger.debug('Adding hero media to zip:', filename);
          zip.file(`assets/${filename}`, blob);
          postData.content.featuredImage.url = `assets/${filename}`;
        }
      } catch (error) {
        this.logger.warn('Error processing hero media:', error);
        // Keep the original URL if processing fails
        postData.content.featuredImage.url = mediaUrl;
      }
    }

    // Handle media in content sections
    if (postData.content.sections) {
      this.logger.debug('Processing content sections for media');
      for (const section of postData.content.sections) {
        if (['image', 'video', 'audio'].includes(section.type) && section.content) {
          const mediaUrl = section.content;
          this.logger.debug('Processing section media:', mediaUrl.substring(0, 50) + '...');
          
          try {
            let blob: Blob | null = null;
            if (mediaUrl.startsWith('data:')) {
              this.logger.debug('Converting base64 section media to blob');
              blob = await this.convertBase64ToBlob(mediaUrl);
            } else if (mediaUrl.startsWith('http')) {
              this.logger.debug('Downloading external section media');
              try {
                const response = await fetch(mediaUrl);
                if (!response.ok) throw new Error('Failed to download image');
                blob = await response.blob();
              } catch (error) {
                this.logger.warn('Failed to download section media, keeping original URL:', error);
                // Keep the original URL if download fails
                section.content = mediaUrl;
              }
            } else {
              this.logger.debug('Loading section media from temp');
              blob = await this.loadAssetFromTemp(mediaUrl);
            }

            if (blob) {
              const filename = `section-media-${Date.now()}-${Math.random().toString(36).substring(7)}.${blob.type.split('/')[1]}`;
              this.logger.debug('Adding section media to zip:', filename);
              zip.file(`assets/${filename}`, blob);
              section.content = `assets/${filename}`;
            }
          } catch (error) {
            this.logger.warn('Error processing section media:', error);
            // Keep the original URL if processing fails
            section.content = mediaUrl;
          }
        }
      }
    }
    
    // Add content
    zip.file('content.json', JSON.stringify(postData, null, 2));
    this.logger.debug('Added content.json to zip');
    
    // Add metadata
    zip.file('metadata.json', JSON.stringify(postData.metadata, null, 2));
    this.logger.debug('Added metadata.json to zip');
    
    // Generate blob
    const blob = await zip.generateAsync({ type: 'blob' });
    this.logger.debug('Generated zip blob, size:', blob.size);
    return blob;
  }

  private async extractBlogPackage(input: File | Blob): Promise<BlogPackage> {
    this.logger.info('Extracting blog package, size:', input.size);
    const zip = await JSZip.loadAsync(input);
    this.logger.debug('Loaded zip file, files:', Object.keys(zip.files));
    
    // Extract content
    const contentJson = await zip.file('content.json')?.async('string');
    if (!contentJson) throw new Error('Invalid blog package: missing content.json');
    const content = JSON.parse(contentJson) as BlogPost;
    this.logger.debug('Extracted content for post:', content.id);
    this.logger.debug('Hero media URL in content:', content.content.featuredImage?.url);
    
    // Clean up any existing temp files for this post
    await this.cleanupTempFiles(content.id);
    this.currentPostId = content.id;
    
    // Extract assets to temp directory
    const assets = new Map<string, Blob>();
    const assetsFolder = zip.folder('assets');
    if (assetsFolder) {
      this.logger.debug('Processing assets folder');
      const assetFiles = Object.keys(assetsFolder.files);
      this.logger.debug('Found assets:', assetFiles);
      
      for (const relativePath of assetFiles) {
        if (!relativePath.endsWith('/')) {  // Skip directories
          const file = zip.file(relativePath);
          if (file) {
            this.logger.debug('Processing asset:', relativePath);
            const blob = await file.async('blob');
            const filename = relativePath.split('/').pop()!;
            this.logger.debug('Saving asset to temp:', filename);
            const tempPath = await this.saveAssetToTemp(content.id, blob, filename);
            assets.set(filename, blob);
            
            // Update media URLs in content to point to temp files
            if (content.content.featuredImage?.url === `assets/${filename}`) {
              this.logger.debug('Updating hero media URL to temp path:', tempPath);
              content.content.featuredImage.url = tempPath;
            }
            
            // Update section media URLs
            if (content.content.sections) {
              for (const section of content.content.sections) {
                if (['image', 'video', 'audio'].includes(section.type) && section.content === `assets/${filename}`) {
                  this.logger.debug('Updating section media URL to temp path:', tempPath);
                  section.content = tempPath;
                }
              }
            }
          }
        }
      }
    } else {
      this.logger.debug('No assets folder found in zip');
    }
    
    return { content, assets, manifest: { version: this.VERSION, created: new Date().toISOString(), lastModified: new Date().toISOString(), assetsList: Array.from(assets.keys()) } };
  }

  public async newBlog(): Promise<BlogPost> {
    // Clear any existing file handle
    this.currentFileHandle = null;
    
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

  public async openBlog(): Promise<BlogPost> {
    try {
      // Ensure database is initialized
      await this.ensureInitialized();
      
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

      const [pickedFile] = await window.showOpenFilePicker(pickerOpts);
      const file = await pickedFile.getFile();
      const filePath = pickedFile.name;
      const fileName = filePath.split('/').pop() || filePath;
      
      // Extract blog package
      const blogPackage = await this.extractBlogPackage(file);
      
      // Store file content in IndexedDB if database is ready
      if (this.db) {
        const content = await file.text();
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
      this.logger.error('Error opening blog:', error);
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
      this.logger.error('Error opening recent file:', error);
      throw new Error('Failed to open recent file');
    }
  }

  public async saveBlog(post: BlogPost, options?: SaveOptions): Promise<void> {
    try {
      this.logger.info('Saving blog post:', post.id);
      
      // Create blog package
      const blogPackage = await this.createBlogPackage(post);
      const blob = blogPackage;
      
      // Always prompt for save location if no file handle exists
      if (!this.currentFileHandle) {
        this.logger.info('No file handle, prompting for save location');
        
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
          
          this.logger.info('Successfully saved to new location:', fileHandle.name);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            this.logger.info('Save operation cancelled by user');
            return;
          }
          throw error;
        }
      } else {
        // Try to save to existing file
        try {
          const writable = await this.currentFileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          this.logger.info('Successfully saved to existing file');
        } catch (error) {
          this.logger.warn('Failed to save to existing file, trying new location:', error);
          // Reset file handle and try again
          this.currentFileHandle = null;
          return this.saveBlog(post, options);
        }
      }
    } catch (error) {
      this.logger.error('Error saving blog:', error);
      throw new Error('Failed to save blog file');
    }
  }

  public async saveBlogAs(post: BlogPost): Promise<void> {
    try {
      this.logger.info('Saving blog as new file');
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
      this.logger.error('Error saving blog as:', error);
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
      this.logger.error('Error exporting blog:', error);
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
    await this.ensureInitialized();
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

  private async ensureTempDirectories() {
    try {
      // Create temp and assets directories if they don't exist
      const root = await navigator.storage.getDirectory();
      await root.getDirectoryHandle(this.TEMP_DIR, { create: true });
      const tempDir = await root.getDirectoryHandle(this.TEMP_DIR);
      await tempDir.getDirectoryHandle(this.ASSETS_DIR, { create: true });
    } catch (error) {
      this.logger.error('Failed to create temp directories:', error);
    }
  }

  private async cleanupTempFiles(postId?: string) {
    try {
      this.logger.debug('Cleaning up temp files for post:', postId);
      const root = await navigator.storage.getDirectory();
      const tempDir = await root.getDirectoryHandle(this.TEMP_DIR);
      const assetsDir = await tempDir.getDirectoryHandle(this.ASSETS_DIR);
      
      if (postId) {
        // Clean up specific post temp files
        try {
          const postDir = await assetsDir.getDirectoryHandle(postId);
          const entries = postDir.values();
          for await (const entry of entries) {
            if (entry.kind === 'file') {
              await postDir.removeEntry(entry.name);
            }
          }
          // Delete the directory itself
          await assetsDir.removeEntry(postId);
        } catch (error) {
          // Directory might not exist, which is fine
          this.logger.debug('No temp directory to clean up for post:', postId);
        }
      } else {
        // Clean up all temp files
        const entries = assetsDir.values();
        for await (const entry of entries) {
          if (entry.kind === 'directory') {
            await assetsDir.removeEntry(entry.name, { recursive: true });
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup temp files:', error);
    }
  }

  private async saveAssetToTemp(postId: string, blob: Blob, filename: string): Promise<string> {
    try {
      this.logger.debug('Saving asset to temp:', { postId, filename });
      const root = await navigator.storage.getDirectory();
      const tempDir = await root.getDirectoryHandle(this.TEMP_DIR);
      const assetsDir = await tempDir.getDirectoryHandle(this.ASSETS_DIR);
      
      // Create post-specific directory
      const postDir = await assetsDir.getDirectoryHandle(postId, { create: true });
      
      // Create file in temp directory
      const fileHandle = await postDir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      // Return a URL that can be used to reference the file
      const objectUrl = URL.createObjectURL(blob);
      this.logger.debug('Created object URL for asset:', objectUrl);
      return objectUrl;
    } catch (error) {
      this.logger.error('Failed to save asset to temp:', error);
      throw error;
    }
  }

  private async loadAssetFromTemp(path: string): Promise<Blob> {
    try {
      this.logger.debug('Loading asset from temp:', path);
      const root = await navigator.storage.getDirectory();
      const tempDir = await root.getDirectoryHandle(this.TEMP_DIR);
      const assetsDir = await tempDir.getDirectoryHandle(this.ASSETS_DIR);
      const postId = path.split('/')[0];
      const filename = path.split('/')[1];
      
      const postDir = await assetsDir.getDirectoryHandle(postId);
      const fileHandle = await postDir.getFileHandle(filename);
      const file = await fileHandle.getFile();
      this.logger.debug('Successfully loaded asset from temp');
      return file;
    } catch (error) {
      this.logger.error('Failed to load asset from temp:', error);
      throw error;
    }
  }

  public async saveToIndexedDB(post: BlogPost): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Convert post to base64 for storage
    const zip = new JSZip();
    zip.file('content.json', JSON.stringify(post, null, 2));
    zip.file('metadata.json', JSON.stringify(post.metadata, null, 2));
    
    try {
      const base64 = await zip.generateAsync({ type: 'base64' });
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.AUTO_SAVE_STORE], 'readwrite');
        const store = transaction.objectStore(this.AUTO_SAVE_STORE);
        
        const request = store.put({
          id: 'auto-save',
          content: `data:application/zip;base64,${base64}`,
          timestamp: new Date().toISOString()
        });

        request.onsuccess = () => {
          this.logger.info('Successfully saved to IndexedDB');
          resolve();
        };
        request.onerror = () => {
          this.logger.error('Error saving to IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.logger.error('Error generating zip:', error);
      throw error;
    }
  }
} 