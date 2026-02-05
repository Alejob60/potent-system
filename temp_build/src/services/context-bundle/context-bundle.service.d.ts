import { Repository } from 'typeorm';
import { ContextBundle } from '../../entities/context-bundle.entity';
import { ContextTurn } from '../../entities/context-turn.entity';
import { RedisService } from '../../common/redis/redis.service';
export declare class ContextBundleService {
    private contextBundleRepository;
    private contextTurnRepository;
    private readonly redisService;
    private readonly logger;
    constructor(contextBundleRepository: Repository<ContextBundle>, contextTurnRepository: Repository<ContextTurn>, redisService: RedisService);
    createContextBundle(sessionId: string, userId: string): Promise<ContextBundle>;
    getContextBundle(sessionId: string): Promise<ContextBundle>;
    updateContextBundle(bundleId: number, updates: Partial<ContextBundle>): Promise<ContextBundle>;
    addContextTurn(bundleId: number, turnData: Partial<ContextTurn>): Promise<ContextTurn>;
    getContextTurns(bundleId: number, limit?: number): Promise<ContextTurn[]>;
    deleteContextBundle(sessionId: string): Promise<void>;
}
