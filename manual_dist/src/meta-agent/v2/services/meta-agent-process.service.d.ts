import { ProcessRequestDto } from '../dtos/process-request.dto';
import { ProcessResponseDto } from '../dtos/process-response.dto';
import { AzureOpenAIGPT5Service } from './azure-openai-gpt5.service';
import { SessionContextService } from './session-context.service';
import { MongoVectorService } from '../../../common/mongodb/mongo-vector.service';
import { TenantContextStore } from '../../security/tenant-context.store';
import { PromptBuilderService } from './prompt-builder.service';
import { ActionParserService } from './action-parser.service';
import { ServiceBusPublisherService } from './service-bus-publisher.service';
import { AzureSpeechService } from './azure-speech.service';
export declare class MetaAgentProcessService {
    private readonly gpt5Service;
    private readonly sessionContextService;
    private readonly vectorService;
    private readonly tenantContextStore;
    private readonly promptBuilder;
    private readonly actionParser;
    private readonly serviceBusPublisher;
    private readonly speechService;
    private readonly logger;
    constructor(gpt5Service: AzureOpenAIGPT5Service, sessionContextService: SessionContextService, vectorService: MongoVectorService, tenantContextStore: TenantContextStore, promptBuilder: PromptBuilderService, actionParser: ActionParserService, serviceBusPublisher: ServiceBusPublisherService, speechService: AzureSpeechService);
    process(request: ProcessRequestDto): Promise<ProcessResponseDto>;
    private convertSpeechToText;
    private buildFallbackResponse;
}
