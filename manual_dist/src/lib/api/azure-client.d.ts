import OpenAI from 'openai';
export declare class AzureClient {
    private openai;
    constructor();
    get embeddings(): OpenAI.Embeddings;
    get chat(): OpenAI.Chat.Completions;
}
