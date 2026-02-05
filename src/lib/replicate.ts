import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReplicateClient {
  private readonly logger = new Logger(ReplicateClient.name);
  private readonly apiToken = process.env.REPLICATE_API_TOKEN;

  async generateImage(prompt: string, model: string = 'black-forest-labs/flux-schnell'): Promise<string> {
    if (!this.apiToken) {
      this.logger.warn('REPLICATE_API_TOKEN not found, returning mock image URL.');
      return 'https://replicate.delivery/pbxt/dummy/out-0.png';
    }

    try {
      this.logger.log(`Generating image with model ${model}...`);
      
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: this.getModelVersion(model),
          input: { prompt }
        },
        {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let prediction = response.data;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const statusResponse = await axios.get(prediction.urls.get, {
          headers: { 'Authorization': `Token ${this.apiToken}` }
        });
        prediction = statusResponse.data;
      }

      if (prediction.status === 'failed') {
        throw new Error('Replicate image generation failed');
      }

      return prediction.output[0];
    } catch (error) {
      this.logger.error(`Error generating image: ${error.message}`);
      return 'https://replicate.delivery/pbxt/dummy/error.png';
    }
  }

  private getModelVersion(model: string): string {
    // Versions for common models
    const versions = {
      'black-forest-labs/flux-schnell': 'a9787eeed0e3f2da2ea3d01ce57a21b55e317a119f5cc351672979fab711713d',
      'black-forest-labs/flux-dev': '444200300a0ef8230aa413ec02631afc4bd7ca4de167b6958c41ca7737c8a324'
    };
    return versions[model] || versions['black-forest-labs/flux-schnell'];
  }
}
