export interface CreativeEntity {
    type: string;
    value: string;
    confidence?: number;
}
export interface CreativeMetadata {
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    requestId?: string;
    [key: string]: any;
}
export interface CreativeAsset {
    url: string;
    type: string;
    size?: number;
    duration?: number;
    [key: string]: any;
}
export type CreativeStatus = 'pending' | 'processing' | 'completed' | 'failed';
export declare class AgentCreativeSynthesizer {
    id: string;
    intention: string;
    emotion: string;
    entities: CreativeEntity[];
    sessionId: string;
    userId: string;
    assetUrl: string;
    assetType: string;
    status: CreativeStatus;
    generationTime: number;
    qualityScore: number;
    metadata: CreativeMetadata;
    assets: CreativeAsset[];
    createdAt: Date;
    updatedAt: Date;
}
