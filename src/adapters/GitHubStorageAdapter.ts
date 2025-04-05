import { StorageAdapter } from './StorageAdapter';
import { BlogPost } from '../types/interfaces';
import { Octokit } from '@octokit/rest';
import { validateAndConvertBlogPost, validateBlogPost, ValidationError } from '../utils/typeValidator';

interface GitHubConfig {
    owner: string;
    repo: string;
    branch?: string;
    token: string;
    basePath?: string;
    imageBasePath?: string;
}

export class GitHubStorageAdapter implements StorageAdapter {
    private octokit: Octokit;
    private config: GitHubConfig;
    private basePath: string;
    private imageBasePath: string;

    constructor(config: GitHubConfig) {
        this.octokit = new Octokit({ auth: config.token });
        this.config = config;
        this.basePath = config.basePath || 'posts';
        this.imageBasePath = config.imageBasePath || 'images';
    }

    private getFilePath(id: string): string {
        return `${this.basePath}/${id}.json`;
    }

    private getImagePath(filename: string): string {
        return `${this.imageBasePath}/${filename}`;
    }

    async save(post: BlogPost): Promise<void> {
        const postToSave = { ...post, $type: 'BlogPost' };

        try {
            validateBlogPost(postToSave);
            
            const content = JSON.stringify(postToSave, null, 2);
            const path = this.getFilePath(post.id);
            
            try {
                // Try to get the file first to check if it exists
                await this.octokit.repos.getContent({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    ref: this.config.branch || 'main'
                });

                // File exists, update it
                await this.octokit.repos.createOrUpdateFileContents({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    message: `Update blog post: ${post.metadata.title}`,
                    content: Buffer.from(content).toString('base64'),
                    branch: this.config.branch || 'main'
                });
            } catch (error) {
                // File doesn't exist, create it
                await this.octokit.repos.createOrUpdateFileContents({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    message: `Create blog post: ${post.metadata.title}`,
                    content: Buffer.from(content).toString('base64'),
                    branch: this.config.branch || 'main'
                });
            }
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
            const path = this.getFilePath(id);
            const response = await this.octokit.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: path,
                ref: this.config.branch || 'main'
            });

            if ('content' in response.data) {
                const content = Buffer.from(response.data.content, 'base64').toString();
                const post = JSON.parse(content);
                return validateAndConvertBlogPost(post);
            }
            return null;
        } catch (error) {
            console.error(`Error loading post ${id}:`, error);
            return null;
        }
    }

    async list(): Promise<BlogPost[]> {
        try {
            const response = await this.octokit.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: this.basePath,
                ref: this.config.branch || 'main'
            });

            if (!Array.isArray(response.data)) {
                return [];
            }

            const posts: BlogPost[] = [];
            for (const item of response.data) {
                if (item.type === 'file' && item.name.endsWith('.json')) {
                    const post = await this.load(item.name.replace('.json', ''));
                    if (post) {
                        posts.push(post);
                    }
                }
            }

            return posts;
        } catch (error) {
            console.error('Error listing posts:', error);
            return [];
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const path = this.getFilePath(id);
            const response = await this.octokit.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: path,
                ref: this.config.branch || 'main'
            });

            if ('sha' in response.data) {
                await this.octokit.repos.deleteFile({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    message: `Delete blog post: ${id}`,
                    sha: response.data.sha,
                    branch: this.config.branch || 'main'
                });
            }
        } catch (error) {
            console.error(`Error deleting post ${id}:`, error);
            throw error;
        }
    }

    async uploadImage(file: File): Promise<string> {
        const filename = `${crypto.randomUUID()}-${file.name}`;
        const path = this.getImagePath(filename);
        
        try {
            const content = await file.arrayBuffer();
            await this.octokit.repos.createOrUpdateFileContents({
                owner: this.config.owner,
                repo: this.config.repo,
                path: path,
                message: `Upload image: ${filename}`,
                content: Buffer.from(content).toString('base64'),
                branch: this.config.branch || 'main'
            });
            
            return `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch || 'main'}/${path}`;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteImage(url: string): Promise<void> {
        try {
            const path = url.split('/').slice(6).join('/');
            const response = await this.octokit.repos.getContent({
                owner: this.config.owner,
                repo: this.config.repo,
                path: path,
                ref: this.config.branch || 'main'
            });

            if ('sha' in response.data) {
                await this.octokit.repos.deleteFile({
                    owner: this.config.owner,
                    repo: this.config.repo,
                    path: path,
                    message: `Delete image: ${path}`,
                    sha: response.data.sha,
                    branch: this.config.branch || 'main'
                });
            }
        } catch (error) {
            console.error(`Error deleting image: ${url}`, error);
            throw error;
        }
    }
}