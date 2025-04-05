import { storageService, StorageService } from '../storageService';
import { eventBus } from '../eventBus';
import { StorageEvent } from '../../types/storageEvents';
import { StorageAdapter } from '../../adapters/StorageAdapter';
import { BlogPost } from '../../types/interfaces';

describe('StorageService', () => {
    const testPost: BlogPost = {
        id: 'test-1',
        metadata: {
            title: 'Test Post',
            author: 'Test Author',
            category: 'Test Category',
            readTime: '5 min',
            featured: false,
            status: 'draft',
            date: new Date().toISOString()
        },
        content: {
            sections: [],
            backgroundColor: '#ffffff'
        }
    };

    let mockAdapter: jest.Mocked<StorageAdapter>;

    beforeAll(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        // Reset eventBus first
        (eventBus.constructor as any).resetForTesting();
        // Then reset StorageService so it subscribes to the new bus
        StorageService.resetForTesting();

        // Get the CURRENT singleton instance after reset
        const currentServiceInstance = StorageService.getInstance();
        
        // Clear any adapters left from previous tests
        currentServiceInstance.clearAdapters();
        
        // Create the mock adapter
        mockAdapter = {
            save: jest.fn().mockResolvedValue(undefined),
            load: jest.fn().mockResolvedValue(null),
            list: jest.fn().mockResolvedValue([]),
            delete: jest.fn().mockResolvedValue(undefined),
            uploadImage: jest.fn().mockResolvedValue('test-url'),
            deleteImage: jest.fn().mockResolvedValue(undefined)
        };

        // Register the adapter on the CURRENT instance
        currentServiceInstance.registerAdapter(mockAdapter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle SAVE events correctly', async () => {
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        
        await eventBus.publish(event);
        
        expect(mockAdapter.save).toHaveBeenCalledWith(testPost);
    });

    it('should handle LOAD events correctly', async () => {
        mockAdapter.load.mockResolvedValue(testPost);
        
        const event: StorageEvent = { type: 'LOAD', payload: { id: 'test-1' } };
        
        await eventBus.publish(event);
        
        expect(mockAdapter.load).toHaveBeenCalledWith('test-1');
        expect(StorageService.getInstance().getState().posts).toEqual([testPost]);
        expect(StorageService.getInstance().getState().error).toBeNull();
    });

    it('should handle LOAD events with missing post correctly', async () => {
        mockAdapter.load.mockResolvedValue(null);
        
        const event: StorageEvent = { type: 'LOAD', payload: { id: 'test-1' } };
        
        await expect(eventBus.publish(event)).rejects.toThrow('Post not found: test-1');
        
        expect(mockAdapter.load).toHaveBeenCalledWith('test-1');
        expect(StorageService.getInstance().getState().posts).toEqual([]);
        expect(StorageService.getInstance().getState().error).toBeInstanceOf(Error);
        expect(StorageService.getInstance().getState().error?.message).toBe('Post not found: test-1');
    });

    it('should handle LIST events correctly', async () => {
        mockAdapter.list.mockResolvedValue([testPost]);
        const event: StorageEvent = { type: 'LIST' };
        
        await eventBus.publish(event);
        
        expect(mockAdapter.list).toHaveBeenCalled();
        expect(StorageService.getInstance().getState().posts).toEqual([testPost]);
    });

    it('should handle DELETE events correctly', async () => {
        const event: StorageEvent = { type: 'DELETE', payload: { id: 'test-1' } };
        
        await eventBus.publish(event);
        
        expect(mockAdapter.delete).toHaveBeenCalledWith('test-1');
    });

    it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        mockAdapter.save.mockRejectedValue(error);
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        
        await expect(eventBus.publish(event)).rejects.toThrow('Test error');
        expect(StorageService.getInstance().getState().error).toBe(error);
    });
}); 