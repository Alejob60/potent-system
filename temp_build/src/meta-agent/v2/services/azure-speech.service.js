"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AzureSpeechService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureSpeechService = void 0;
const common_1 = require("@nestjs/common");
let AzureSpeechService = AzureSpeechService_1 = class AzureSpeechService {
    constructor() {
        this.logger = new common_1.Logger(AzureSpeechService_1.name);
        this.defaultLanguage = 'es-ES';
        this.defaultVoice = 'es-ES-ElviraNeural';
        const subscriptionKey = process.env.AZURE_SPEECH_KEY || '';
        const region = process.env.AZURE_SPEECH_REGION || 'eastus';
        if (!subscriptionKey) {
            this.logger.warn('⚠️ Azure Speech not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION. ' +
                'Install SDK: npm install microsoft-cognitiveservices-speech-sdk');
        }
    }
    async speechToText(audioUrl, language) {
        this.logger.warn(`Speech-to-Text stub called for URL: ${audioUrl}. ` +
            'Install microsoft-cognitiveservices-speech-sdk for full implementation.');
        return {
            text: '[Speech transcription not available - install microsoft-cognitiveservices-speech-sdk]',
            confidence: 0,
            duration: 0,
            offset: 0
        };
    }
    async textToSpeech(options) {
        this.logger.warn(`Text-to-Speech stub called for text: "${options.text.substring(0, 50)}...". ` +
            'Install microsoft-cognitiveservices-speech-sdk for full implementation.');
        return Buffer.from([]);
    }
    async getAvailableVoices(language = 'es-ES') {
        return [
            'es-ES-ElviraNeural',
            'es-ES-AlvaroNeural',
            'es-MX-DaliaNeural',
            'es-MX-JorgeNeural'
        ];
    }
    validateAudioFormat(audioBuffer) {
        if (!audioBuffer || audioBuffer.length === 0) {
            return { valid: false, error: 'Empty audio buffer' };
        }
        if (audioBuffer.length < 1024) {
            return { valid: false, error: 'Audio file too small' };
        }
        if (audioBuffer.length > 10 * 1024 * 1024) {
            return { valid: false, error: 'Audio file too large (max 10MB)' };
        }
        return { valid: true };
    }
};
exports.AzureSpeechService = AzureSpeechService;
exports.AzureSpeechService = AzureSpeechService = AzureSpeechService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AzureSpeechService);
//# sourceMappingURL=azure-speech.service.js.map