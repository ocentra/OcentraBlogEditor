import { storageService } from './storageService';
import { eventBus } from './eventBus';
import { StorageAdapter } from '../adapters/StorageAdapter';
import { BlogPost } from '../types/interfaces';
import { StorageEvent } from '../types/storageEvents';

describe('StorageService', () => {
    let mockAdapter: StorageAdapter;
    const testPost: BlogPost = {
        id: '1',
        metadata: {
            title: 'Test Post',
            author: 'Test Author',
            category: 'Test',
            readTime: '5 min',
            featured: false,
            status: 'draft',
            date: '2024-03-20'
        },
        content: {
            sections: [],
            backgroundColor: '#ffffff'
        }
    };

    beforeEach(() => {
        // Reset both EventBus and StorageService before each test
        (eventBus.constructor as any).resetForTesting();
        (storageService.constructor as any).resetForTesting();
        
        // Clear any existing adapters
        storageService.clearAdapters();

        // Create a new mock adapter for each test
        mockAdapter = {
            save: jest.fn().mockResolvedValue(undefined),
            load: jest.fn().mockResolvedValue(testPost),
            delete: jest.fn().mockResolvedValue(undefined),
            list: jest.fn().mockResolvedValue([testPost])
        };

        // Register the mock adapter
        storageService.registerAdapter(mockAdapter);
    });

    describe('save operation', () => {
        it('should handle save events correctly', async () => {
            const saveEvent: StorageEvent = {
                type: 'SAVE',
                payload: testPost
            };

            await eventBus.publish(saveEvent);
            
            expect(mockAdapter.save).toHaveBeenCalledWith(testPost);
            const state = storageService.getState();
            expect(state.posts).toContainEqual(testPost);
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('should handle save errors correctly', async () => {
            const error = new Error('Save failed');
            mockAdapter.save = jest.fn().mockRejectedValue(error);

            const saveEvent: StorageEvent = {
                type: 'SAVE',
                payload: testPost
            };

            await expect(eventBus.publish(saveEvent)).rejects.toThrow('Save failed');
            
            const state = storageService.getState();
            expect(state.error).toEqual(error);
            expect(state.isLoading).toBe(false);
        });
    });

    describe('load operation', () => {
        it('should handle load events correctly', async () => {
            const loadEvent: StorageEvent = {
                type: 'LOAD',
                payload: { id: '1' }
            };

            await eventBus.publish(loadEvent);
            
            expect(mockAdapter.load).toHaveBeenCalledWith('1');
            const state = storageService.getState();
            expect(state.posts).toContainEqual(testPost);
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('should handle load errors correctly', async () => {
            mockAdapter.load = jest.fn().mockResolvedValue(null);

            const loadEvent: StorageEvent = {
                type: 'LOAD',
                payload: { id: '1' }
            };

            await expect(eventBus.publish(loadEvent)).rejects.toThrow('Post not found: 1');
            
            const state = storageService.getState();
            expect(state.error).toBeTruthy();
            expect(state.isLoading).toBe(false);
        });
    });

    describe('delete operation', () => {
        it('should handle delete events correctly', async () => {
            // First save a post
            await eventBus.publish({
                type: 'SAVE',
                payload: testPost
            });

            const deleteEvent: StorageEvent = {
                type: 'DELETE',
                payload: { id: '1' }
            };

            await eventBus.publish(deleteEvent);
            
            expect(mockAdapter.delete).toHaveBeenCalledWith('1');
            const state = storageService.getState();
            expect(state.posts).not.toContainEqual(testPost);
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('should handle delete errors correctly', async () => {
            const error = new Error('Delete failed');
            mockAdapter.delete = jest.fn().mockRejectedValue(error);

            const deleteEvent: StorageEvent = {
                type: 'DELETE',
                payload: { id: '1' }
            };

            await expect(eventBus.publish(deleteEvent)).rejects.toThrow('Delete failed');
            
            const state = storageService.getState();
            expect(state.error).toEqual(error);
            expect(state.isLoading).toBe(false);
        });
    });

    describe('list operation', () => {
        it('should handle list events correctly', async () => {
            const listEvent: StorageEvent = {
                type: 'LIST'
            };

            await eventBus.publish(listEvent);
            
            expect(mockAdapter.list).toHaveBeenCalled();
            const state = storageService.getState();
            expect(state.posts).toContainEqual(testPost);
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('should handle list errors correctly', async () => {
            const error = new Error('List failed');
            mockAdapter.list = jest.fn().mockRejectedValue(error);

            const listEvent: StorageEvent = {
                type: 'LIST'
            };

            await expect(eventBus.publish(listEvent)).rejects.toThrow('List failed');
            
            const state = storageService.getState();
            expect(state.error).toEqual(error);
            expect(state.isLoading).toBe(false);
        });
    });
}); 