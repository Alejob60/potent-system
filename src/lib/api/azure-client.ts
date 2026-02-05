import OpenAI from 'openai';

// Clase AzureClient para uso en NestJS
export class AzureClient {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
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