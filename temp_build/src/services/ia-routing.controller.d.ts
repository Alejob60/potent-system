import { AzureFoundryIARouterService } from './azure-foundry-ia-router.service';
import { ChatCompletionRequestDto } from './dto/chat-completion-request.dto';
import { ChatCompletionResponseDto } from './dto/chat-completion-response.dto';
export declare class RouteMessageDto {
    message: string;
    context?: any;
}
export declare class CompareModelsDto {
    prompt: string;
    models: string[];
}
export declare class IARoutingController {
    private readonly iaRouterService;
    private readonly logger;
    constructor(iaRouterService: AzureFoundryIARouterService);
    processChatCompletion(request: ChatCompletionRequestDto): Promise<ChatCompletionResponseDto>;
    routeMessage(routeMessageDto: RouteMessageDto): Promise<{
        routedModel: string;
    }>;
    compareModels(compareModelsDto: CompareModelsDto): Promise<any>;
    getRateLimitStatus(): Promise<any>;
}
