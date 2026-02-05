export declare enum ChannelType {
    WEB = "web",
    WHATSAPP = "whatsapp",
    VOICE = "voice",
    INSTAGRAM = "instagram",
    TELEGRAM = "telegram"
}
export declare enum InputType {
    TEXT = "text",
    SPEECH = "speech",
    EVENT = "event"
}
export declare class InputDto {
    type: InputType;
    text?: string;
    speechUrl?: string;
    metadata?: Record<string, any>;
}
export declare class ProcessRequestDto {
    tenantId: string;
    sessionId: string;
    correlationId: string;
    userId?: string;
    channel: ChannelType;
    input: InputDto;
    contextHints?: Record<string, any>;
}
