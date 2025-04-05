import { StorageAdapter } from '../adapters/StorageAdapter';
import { StorageEvent, StorageState } from '../types/storageEvents';
import { eventBus } from './eventBus';
import { BlogPost } from '../types/interfaces';

class StorageService {
    private static instance: StorageService;
    private adapters: StorageAdapter[];
    private state: StorageState;

    private constructor() {
        this.adapters = [];
        this.state = {
            isLoading: false,
            error: null,
            lastOperation: null,
            posts: []
        };

        this.initializeEventHandlers();
    }

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    public static resetForTesting(): void {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        } else {
            // Reset state but keep adapters
            StorageService.instance.state = {
                isLoading: false,
                error: null,
                lastOperation: null,
                posts: []
            };
            // Re-initialize event handlers
            StorageService.instance.initializeEventHandlers();
        }
    }

    public registerAdapter(adapter: StorageAdapter): void {
        this.adapters.push(adapter);
    }

    public getState(): StorageState {
        return { ...this.state }; // Return a copy to prevent direct state mutation
    }

    private initializeEventHandlers(): void {
        eventBus.subscribe(this.handleSave.bind(this), 'SAVE');
        eventBus.subscribe(this.handleLoad.bind(this), 'LOAD');
        eventBus.subscribe(this.handleDelete.bind(this), 'DELETE');
        eventBus.subscribe(this.handleList.bind(this), 'LIST');
    }

    private async handleSave(event: StorageEvent): Promise<void> {
        if (event.type !== 'SAVE') return;

        this.state.isLoading = true;
        this.state.lastOperation = event;
        this.state.error = null;

        try {
            await Promise.all(this.adapters.map(adapter => adapter.save(event.payload)));
            // Update local state
            const existingIndex = this.state.posts.findIndex(p => p.id === event.payload.id);
            if (existingIndex >= 0) {
                this.state.posts[existingIndex] = event.payload;
            } else {
                this.state.posts.push(event.payload);
            }
        } catch (error) {
            this.state.error = error instanceof Error ? error : new Error(String(error));
            throw this.state.error;
        } finally {
            this.state.isLoading = false;
        }
    }

    private async handleLoad(event: StorageEvent): Promise<void> {
        if (event.type !== 'LOAD') return;

        this.state.isLoading = true;
        this.state.lastOperation = event;
        this.state.error = null;
        this.state.posts = [];

        if (this.adapters.length === 0) {
            this.state.error = new Error('No storage adapters registered');
            throw this.state.error;
        }

        try {
            const post = await this.adapters[0].load(event.payload.id);
            if (post) {
                this.state.posts = [post];
            } else {
                this.state.error = new Error(`Post not found: ${event.payload.id}`);
                throw this.state.error;
            }
        } catch (error) {
            this.state.error = error instanceof Error ? error : new Error(String(error));
            throw this.state.error;
        } finally {
            this.state.isLoading = false;
        }
    }

    private async handleDelete(event: StorageEvent): Promise<void> {
        if (event.type !== 'DELETE') return;

        this.state.isLoading = true;
        this.state.lastOperation = event;
        this.state.error = null;

        try {
            await Promise.all(this.adapters.map(adapter => adapter.delete(event.payload.id)));
            // Update local state
            this.state.posts = this.state.posts.filter(post => post.id !== event.payload.id);
        } catch (error) {
            this.state.error = error instanceof Error ? error : new Error(String(error));
            throw this.state.error;
        } finally {
            this.state.isLoading = false;
        }
    }

    private async handleList(event: StorageEvent): Promise<void> {
        if (event.type !== 'LIST') return;

        this.state.isLoading = true;
        this.state.lastOperation = event;
        this.state.error = null;

        try {
            const results = await Promise.all(this.adapters.map(adapter => adapter.list()));
            // Merge and deduplicate posts from all adapters
            const uniquePosts = new Map<string, BlogPost>();
            results.flat().forEach(post => uniquePosts.set(post.id, post));
            this.state.posts = Array.from(uniquePosts.values());
        } catch (error) {
            this.state.error = error instanceof Error ? error : new Error(String(error));
            throw this.state.error;
        } finally {
            this.state.isLoading = false;
        }
    }

    // For testing purposes only
    public clearAdapters(): void {
        this.adapters = [];
    }
}

export { StorageService };
export const storageService = StorageService.getInstance(); 