import { Repository } from 'typeorm';
import { ProfessionalLog } from '../../entities/professional-log.entity';
export declare class ProfessionalLoggerService {
    private readonly logRepository;
    private readonly logger;
    constructor(logRepository: Repository<ProfessionalLog>);
    log(logData: {
        category: string;
        action: string;
        userId?: string;
        productId?: string;
        reference?: string;
        message?: string;
        metadata?: any;
        timestamp: Date;
    }): Promise<void>;
    getLogsByCategory(category: string, limit?: number): Promise<ProfessionalLog[]>;
    getLogsByTimeRange(startTime: Date, endTime: Date, limit?: number): Promise<ProfessionalLog[]>;
}
