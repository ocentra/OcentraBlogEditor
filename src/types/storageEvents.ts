import { BlogPost } from './interfaces';

export type StorageEventType = 'SAVE' | 'LOAD' | 'DELETE' | 'LIST';

export type StorageEvent = 
    | { type: 'SAVE'; payload: BlogPost }
    | { type: 'LOAD'; payload: { id: string } }
    | { type: 'DELETE'; payload: { id: string } }
    | { type: 'LIST' };

export interface StorageResult<T> {
    data?: T;
    error?: Error;
    status: 'success' | 'error' | 'loading';
}

export interface StorageState {
    isLoading: boolean;
    error: Error | null;
    lastOperation: StorageEvent | null;
    posts: BlogPost[];
}

export type EventHandler = (event: StorageEvent) => Promise<void>;
export type EventSubscriber = (event: StorageEvent, result: StorageResult<any>) => void; 