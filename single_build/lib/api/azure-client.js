"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureClient = void 0;
const openai_1 = __importDefault(require("openai"));
// Clase AzureClient para uso en NestJS
class AzureClient {
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.AZURE_OPENAI_KEY || 'your-api-key',
            baseURL: 'https://your-azure-openai-instance.openai.azure.com/openai/deployments',
            defaultQuery: { 'api-version': '2023-05-15' },
            defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
        });
    }
    get embeddings() {
        return this.openai.embeddings;
    }
    get chat() {
        return this.openai.chat.completions;
    }
}
exports.AzureClient = AzureClient;
