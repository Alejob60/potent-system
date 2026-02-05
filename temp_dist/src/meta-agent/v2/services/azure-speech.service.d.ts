/// <reference types="node" />
/// <reference types="node" />
export interface SpeechToTextResult {
    text: string;
    confidence: number;
    duration: number;
    offset: number;
}
export interface TextToSpeechOptions {
    text: string;
    voice?: string;
    language?: string;
    outputFormat?: 'audio-16khz-128kbitrate-mono-mp3' | 'audio-24khz-48kbitrate-mono-mp3';
}
export declare class AzureSpeechService {
    private readonly logger;
    private readonly defaultLanguage;
    private readonly defaultVoice;
    constructor();
    speechToText(audioUrl: string, language?: string): Promise<SpeechToTextResult>;
    textToSpeech(options: TextToSpeechOptions): Promise<Buffer>;
    getAvailableVoices(language?: string): Promise<string[]>;
    validateAudioFormat(audioBuffer: Buffer): {
        valid: boolean;
        error?: string;
    };
}
