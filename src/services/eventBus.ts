import { StorageEvent, StorageResult, EventHandler, EventSubscriber } from '../types/storageEvents';

class EventBus {
    private static instance: EventBus;
    private handlers: Map<StorageEvent['type'], EventHandler[]>;
    private subscribers: EventSubscriber[];

    private constructor() {
        this.handlers = new Map();
        this.subscribers = [];
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public static resetForTesting(): void {
        EventBus.instance = new EventBus();
    }

    public subscribe(handler: EventHandler, eventType: StorageEvent['type']): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
    }

    public addSubscriber(subscriber: EventSubscriber): void {
        this.subscribers.push(subscriber);
    }

    public removeSubscriber(subscriber: EventSubscriber): void {
        this.subscribers = this.subscribers.filter(s => s !== subscriber);
    }

    public async publish(event: StorageEvent): Promise<void> {
        const handlers = this.handlers.get(event.type) || [];
        
        // Notify subscribers that operation started
        this.notifySubscribers(event, { status: 'loading' });

        try {
            // Execute all handlers for this event type
            await Promise.all(handlers.map(handler => handler(event)));
            
            // Notify subscribers of success
            this.notifySubscribers(event, { status: 'success' });
        } catch (error) {
            // Notify subscribers of error
            this.notifySubscribers(event, { 
                status: 'error', 
                error: error instanceof Error ? error : new Error(String(error))
            });
            throw error; // Re-throw the error for the caller to handle
        }
    }

    private notifySubscribers(event: StorageEvent, result: StorageResult<any>): void {
        this.subscribers.forEach(subscriber => subscriber(event, result));
    }
}

export const eventBus = EventBus.getInstance(); 