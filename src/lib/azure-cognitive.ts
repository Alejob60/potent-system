import { OpenAI } from 'openai';
import axios from 'axios';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export class AzureCognitiveClient {
  private static readonly logger = new Logger(AzureCognitiveClient.name);
  private static openaiClient: OpenAI;

  static getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
      });
    }
    return this.openaiClient;
  }

  /**
   * Helper to call Azure Document Intelligence REST API
   * Since the SDK might not be installed, we use axios for stability.
   */
  static async analyzeDocument(fileBuffer: Buffer, contentType: string): Promise<string> {
    const endpoint = process.env.AZURE_DOC_INTEL_ENDPOINT;
    const key = process.env.AZURE_DOC_INTEL_KEY;

    if (!endpoint || !key) {
      throw new InternalServerErrorException('Azure Document Intelligence configuration missing');
    }

    try {
      // 1. Start Analysis
      const analyzeUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;
      const response = await axios.post(analyzeUrl, fileBuffer, {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': contentType,
        },
      });

      const operationLocation = response.headers['operation-location'];
      
      // 2. Poll for results
      let status = 'running';
      let result = null;

      while (status === 'running' || status === 'notStarted') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const statusResponse = await axios.get(operationLocation, {
          headers: { 'Ocp-Apim-Subscription-Key': key },
        });
        status = statusResponse.data.status;
        if (status === 'succeeded') {
          result = statusResponse.data.analyzeResult;
        } else if (status === 'failed') {
          throw new Error('Azure Document Analysis failed');
        }
      }

      if (!result) {
        throw new Error('Azure Document Analysis result is null');
      }
      return (result as any).content || '';
    } catch (error) {
      this.logger.error(`Error analyzing document: ${error.message}`);
      throw new InternalServerErrorException(`Azure Document Intelligence error: ${error.message}`);
    }
  }
}
