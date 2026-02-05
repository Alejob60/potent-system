"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureClient = void 0;
var openai_1 = require("openai");
// Clase AzureClient para uso en NestJS
var AzureClient = /** @class */ (function () {
    function AzureClient() {
        this.openai = new openai_1.default({
            apiKey: process.env.AZURE_OPENAI_KEY || 'your-api-key',
            baseURL: 'https://your-azure-openai-instance.openai.azure.com/openai/deployments',
            defaultQuery: { 'api-version': '2023-05-15' },
            defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
        });
    }
    Object.defineProperty(AzureClient.prototype, "embeddings", {
        get: function () {
            return this.openai.embeddings;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AzureClient.prototype, "chat", {
        get: function () {
            return this.openai.chat.completions;
        },
        enumerable: false,
        configurable: true
    });
    return AzureClient;
}());
exports.AzureClient = AzureClient;
