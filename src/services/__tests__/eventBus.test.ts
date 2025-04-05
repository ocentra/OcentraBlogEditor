import { eventBus } from '../eventBus';
import { StorageEvent } from '../../types/storageEvents';
import { BlogPost } from '../../types/interfaces';

describe('EventBus', () => {
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

    beforeEach(() => {
        (eventBus.constructor as any).resetForTesting();
    });

    it('should publish and subscribe correctly', async () => {
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        const handler = jest.fn().mockResolvedValue(undefined);

        eventBus.subscribe(handler, 'SAVE');
        await eventBus.publish(event);

        expect(handler).toHaveBeenCalledWith(event);
    });

    it('should handle multiple subscribers correctly', async () => {
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        const handler1 = jest.fn().mockResolvedValue(undefined);
        const handler2 = jest.fn().mockResolvedValue(undefined);

        eventBus.subscribe(handler1, 'SAVE');
        eventBus.subscribe(handler2, 'SAVE');
        await eventBus.publish(event);

        expect(handler1).toHaveBeenCalledWith(event);
        expect(handler2).toHaveBeenCalledWith(event);
    });

    it('should handle subscribers correctly', async () => {
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        const handler = jest.fn().mockResolvedValue(undefined);
        const subscriber = jest.fn();

        eventBus.subscribe(handler, 'SAVE');
        eventBus.addSubscriber(subscriber);
        await eventBus.publish(event);

        expect(handler).toHaveBeenCalledWith(event);
        expect(subscriber).toHaveBeenCalledTimes(2); // Once for loading, once for success
        expect(subscriber).toHaveBeenCalledWith(event, expect.objectContaining({ status: 'loading' }));
        expect(subscriber).toHaveBeenCalledWith(event, expect.objectContaining({ status: 'success' }));
    });

    it('should handle error subscribers correctly', async () => {
        const event: StorageEvent = { type: 'SAVE', payload: testPost };
        const errorHandler = jest.fn().mockRejectedValue(new Error('Test error'));
        const subscriber = jest.fn();

        eventBus.subscribe(errorHandler, 'SAVE');
        eventBus.addSubscriber(subscriber);
        
        await expect(eventBus.publish(event)).rejects.toThrow('Test error');
        expect(errorHandler).toHaveBeenCalledWith(event);
        expect(subscriber).toHaveBeenCalledTimes(2); // Once for loading, once for error
        expect(subscriber).toHaveBeenCalledWith(event, expect.objectContaining({ status: 'loading' }));
        expect(subscriber).toHaveBeenCalledWith(event, expect.objectContaining({ 
            status: 'error',
            error: expect.any(Error)
        }));
    });
}); 