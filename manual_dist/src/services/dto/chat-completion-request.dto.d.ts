export declare class MessageDto {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare class ChatCompletionRequestDto {
    messages: MessageDto[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}
