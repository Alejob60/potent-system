import { Repository } from 'typeorm';
import { WebhookEvent } from '../../entities/payments/webhook-event.entity';
export declare class WebhookIdempotencyService {
    private readonly webhookEventRepository;
    private readonly logger;
    constructor(webhookEventRepository: Repository<WebhookEvent>);
    isEventProcessed(eventId: string, eventData: any): Promise<boolean>;
    markEventAsProcessed(eventId: string, eventData: any, status: string): Promise<boolean>;
    isOrderCompleted(reference: string): Promise<boolean>;
    getEventStatistics(): Promise<any>;
    cleanupOldEvents(days?: number): Promise<number>;
}
