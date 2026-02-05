export declare class ProductDto {
    name: string;
    features: string[];
}
export declare class CreateAgentVideoScriptorDto {
    sessionId: string;
    emotion: string;
    platform: string;
    format: string;
    objective: string;
    product: ProductDto;
}
