import { StorageAdapter } from '../adapters/StorageAdapter';
import { BlogPost } from '../types/interfaces';

export class SyncManager implements StorageAdapter {
    private adapters: StorageAdapter[] = [];

    addAdapter(adapter: StorageAdapter): void {
        this.adapters.push(adapter);
    }

    async save(post: BlogPost): Promise<void> {
        const errors: Error[] = [];

        for (const adapter of this.adapters) {
            try {
                await adapter.save(post);
            } catch (error) {
                errors.push(error as Error);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Failed to save post in some adapters: ${errors.map(e => e.message).join(', ')}`);
        }
    }

    async load(id: string): Promise<BlogPost | null> {
        for (const adapter of this.adapters) {
            const post = await adapter.load(id);
            if (post) {
                return post;
            }
        }
        return null;
    }

    async list(): Promise<BlogPost[]> {
        const allPosts = new Map<string, BlogPost>();

        for (const adapter of this.adapters) {
            const posts = await adapter.list();
            for (const post of posts) {
                allPosts.set(post.id, post);
            }
        }

        return Array.from(allPosts.values());
    }

    async delete(id: string): Promise<void> {
        const errors: Error[] = [];

        for (const adapter of this.adapters) {
            try {
                await adapter.delete(id);
            } catch (error) {
                errors.push(error as Error);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Failed to delete post in some adapters: ${errors.map(e => e.message).join(', ')}`);
        }
    }

    async uploadImage(file: File): Promise<string> {
        for (const adapter of this.adapters) {
            if (adapter.uploadImage) {
                try {
                    return await adapter.uploadImage(file);
                } catch (error) {
                    console.error(`Failed to upload image with adapter: ${error}`);
                }
            }
        }
        throw new Error('No adapter available for image upload');
    }

    async deleteImage(url: string): Promise<void> {
        const errors: Error[] = [];

        for (const adapter of this.adapters) {
            if (adapter.deleteImage) {
                try {
                    await adapter.deleteImage(url);
                } catch (error) {
                    errors.push(error as Error);
                }
            }
        }

        if (errors.length > 0) {
            throw new Error(`Failed to delete image in some adapters: ${errors.map(e => e.message).join(', ')}`);
        }
    }
} 