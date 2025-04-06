import { StorageAdapter, BlogPostSummary } from './StorageAdapter';
import { BlogPost } from '../types/interfaces';
import { validateAndConvertBlogPost, validateBlogPost, ValidationError } from '../utils/typeValidator';
import { Logger } from '../utils/logger';
import { GlobalLogger } from '../utils/globalLogger';

interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string;
  token: string; // IMPORTANT: Handle securely, DO NOT hardcode in production client-side code
  basePath?: string; // e.g., 'posts' or 'src/posts'
  imageBasePath?: string; // e.g., 'images' or 'assets/images'
}

export class GitHubStorageAdapter implements StorageAdapter {
  private readonly config: Required<GitHubConfig>;
  private readonly apiUrl: string;
  private readonly rawContentUrl: string;
  private readonly logger = Logger.getInstance('[GitHubStorageAdapter]');

  constructor(config: GitHubConfig) {
    if (!config.token) {
      throw new Error("GitHubStorageAdapter: Missing Personal Access Token (PAT).");
    }
    this.config = {
      branch: 'main',
      basePath: 'content/posts',
      imageBasePath: 'content/images',
      ...config,
    };
    this.apiUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents`;
    this.rawContentUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}`;
    // Register with global logger
    GlobalLogger.enableComponent('[GitHubStorageAdapter]');
    this.logger.info('Initialized with config:', {
      owner: this.config.owner,
      repo: this.config.repo,
      branch: this.config.branch,
      basePath: this.config.basePath,
      imageBasePath: this.config.imageBasePath
    });
  }

  private getHeaders(): HeadersInit {
    return {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${this.config.token}`,
      'Content-Type': 'application/json',
    };
  }

  private getFilePath(postId: string): string {
    return `${this.config.basePath}/${postId}/post.json`;
  }

  private getImagePath(fileName: string): string {
    const timestamp = new Date().getTime();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    return `${this.config.imageBasePath}/${timestamp}-${safeName}`;
  }

  private async getFileContent(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${path}?ref=${this.config.branch}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to get file content: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.content,
        sha: data.sha
      };
    } catch (error) {
      this.logger.error(`Error getting file content for ${path}:`, error);
      return null;
    }
  }

  private async updateOrCreateFile(
    path: string, 
    content: string, 
    message: string
  ): Promise<{ url: string; sha: string }> {
    const existingFile = await this.getFileContent(path);
    const body: any = {
      message,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: this.config.branch
    };

    if (existingFile?.sha) {
      body.sha = existingFile.sha;
    }

    const response = await fetch(`${this.apiUrl}/${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update/create file: ${response.statusText} - ${errorData.message}`);
    }

    const data = await response.json();
    return {
      url: `${this.rawContentUrl}/${path}`,
      sha: data.content.sha
    };
  }

  async save(post: BlogPost): Promise<string> {
    this.logger.info('Saving post to GitHub:', post.id);
    const postId = post.id || crypto.randomUUID();
    const postToSave = { ...post, id: postId, $type: 'BlogPost' };
    const filePath = this.getFilePath(postId);
    const commitMessage = `docs: ${post.metadata.status === 'published' ? 'Publish' : 'Update draft'} ${post.metadata.title || postId}`;

    try {
      // Validate before saving
      validateBlogPost(postToSave);
      
      await this.updateOrCreateFile(
        filePath,
        JSON.stringify(postToSave, null, 2),
        commitMessage
      );
      this.logger.info('Successfully saved post:', postId);
      return postId;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.error('Validation error saving post:', error.message);
      } else {
        this.logger.error('Error saving post:', error);
      }
      this.logger.error('Failed to save post:', error);
      throw error;
    }
  }

  async load(id: string): Promise<BlogPost | null> {
    this.logger.info('Loading post from GitHub:', id);
    const filePath = this.getFilePath(id);
    const fileData = await this.getFileContent(filePath);

    if (!fileData) {
      this.logger.debug('Post not found:', id);
      return null;
    }

    try {
      const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
      const post = validateAndConvertBlogPost(decodedContent);
      this.logger.info('Successfully loaded post:', id);
      return post;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.error(`Validation error loading post ${id}:`, error.message);
      } else {
        this.logger.error(`Error parsing post ${id}:`, error);
      }
      this.logger.error('Failed to load post:', error);
      return null;
    }
  }

  async list(): Promise<BlogPostSummary[]> {
    this.logger.info('Listing all posts from GitHub');
    try {
      const response = await fetch(`${this.apiUrl}/${this.config.basePath}?ref=${this.config.branch}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`Failed to list posts: ${response.statusText}`);
      }

      const contents = await response.json();
      if (!Array.isArray(contents)) return [];

      const summaries: BlogPostSummary[] = [];
      
      // Process each directory in parallel
      await Promise.all(
        contents
          .filter(item => item.type === 'dir')
          .map(async (dir) => {
            const post = await this.load(dir.name);
            if (post) {
              summaries.push({
                id: post.id,
                title: post.metadata.title,
                date: post.metadata.date,
                status: post.metadata.status
              });
            }
          })
      );

      this.logger.info('Found posts:', summaries.length);
      return summaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      this.logger.error("Error listing posts:", error);
      this.logger.error('Failed to list posts:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Deleting post from GitHub:', id);
    const filePath = this.getFilePath(id);
    const fileData = await this.getFileContent(filePath);

    if (!fileData) {
      this.logger.warn(`Post ${id} not found for deletion.`);
      return;
    }

    const response = await fetch(`${this.apiUrl}/${filePath}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message: `docs: Delete post ${id}`,
        sha: fileData.sha,
        branch: this.config.branch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete post: ${response.statusText} - ${errorData.message}`);
    }
    this.logger.info('Successfully deleted post:', id);
  }

  async uploadImage(file: File): Promise<string> {
    this.logger.info('Uploading image to GitHub:', file.name);
    const imagePath = this.getImagePath(file.name);
    
    try {
      // Read file as binary data
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      
      const { url } = await this.updateOrCreateFile(
        imagePath,
        binaryString,
        `docs: Upload image ${file.name}`
      );

      this.logger.info('Successfully uploaded image:', file.name);
      return url;
    } catch (error: any) {
      this.logger.error('Error uploading image:', error);
      this.logger.error('Failed to upload image:', error);
      throw new Error(`Failed to upload image: ${error?.message || 'Unknown error'}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    this.logger.info('Deleting image from GitHub:', url);
    // Extract the path from the raw GitHub URL
    const urlPath = url.split(`${this.rawContentUrl}/`)[1];
    if (!urlPath) {
      throw new Error('Invalid GitHub image URL');
    }

    const fileData = await this.getFileContent(urlPath);
    if (!fileData) {
      this.logger.warn('Image not found for deletion.');
      return;
    }

    const response = await fetch(`${this.apiUrl}/${urlPath}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message: `docs: Delete image ${urlPath.split('/').pop()}`,
        sha: fileData.sha,
        branch: this.config.branch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to delete image: ${response.statusText} - ${errorData.message}`);
    }
    this.logger.info('Successfully deleted image:', url);
  }
}