declare class ChoiceDto {
    index: number;
    message: {
        role: string;
        content: string;
    };
    finish_reason: string;
}
declare class UsageDto {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
export declare class ChatCompletionResponseDto {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChoiceDto[];
    usage: UsageDto;
}
export {};
