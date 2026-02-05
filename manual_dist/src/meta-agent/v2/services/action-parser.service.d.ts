import { ActionDto } from '../dtos/process-response.dto';
export declare class ActionParserService {
    private readonly logger;
    private readonly actionPattern;
    parseActions(responseText: string): ActionDto[];
    private validateAction;
    private getDefaultTarget;
    extractCleanResponse(responseText: string): string;
    validateActionParams(action: ActionDto): {
        valid: boolean;
        errors: string[];
    };
    buildActionExample(actionType: string): string;
}
