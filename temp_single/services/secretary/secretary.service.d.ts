import { VectorMemoryService } from '../memory/vector-memory.service';
import { AzureClient } from '../../lib/api/azure-client';
export interface UserInput {
    text: string;
    channel: string;
    sessionId?: string;
    metadata?: Record<string, any>;
}
export interface SecretaryResponse {
    action: 'INIT_TOOL' | 'EXECUTE_TASK' | 'CHAT' | 'UI_SHOW_LOADER' | 'UI_ASK_INPUT' | 'UI_RENDER_NODE';
    content?: string;
    tool?: string;
    jobId?: string;
    nodeId?: string;
    data?: any;
    requiresInput?: boolean;
}
export declare class SecretaryService {
    private readonly vectorMemoryService;
    private readonly azureClient;
    private readonly logger;
    constructor(vectorMemoryService: VectorMemoryService, azureClient: AzureClient);
    /**
     * Método maestro: procesa la solicitud del usuario
     */
    processUserRequest(userId: string, tenantId: string, input: UserInput): Promise<SecretaryResponse>;
    /**
     * Analiza la intención del usuario usando Azure OpenAI
     */
    private analyzeIntent;
    /**
     * Maneja la inicialización de herramientas
     */
    private handleInitTool;
    /**
     * Maneja la ejecución de tareas
     */
    private handleExecuteTask;
    /**
     * Maneja conversaciones generales
     */
    private handleChat;
}
