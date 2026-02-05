import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TrendsService {
  private readonly logger = new Logger(TrendsService.name);
  private readonly serpApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serpApiKey = this.configService.get<string>('SERP_API_KEY') || '';
  }

  /**
   * Fetch current trends for a specific topic using SerpApi (Google Trends)
   */
  async getTrends(topic: string): Promise<any[]> {
    this.logger.log(`Fetching trends for topic: ${topic}`);

    if (!this.serpApiKey) {
      this.logger.warn('SERP_API_KEY not found, returning simulated trends.');
      return [
        { title: `${topic} is booming in TikTok`, link: 'https://trends.google.com' },
        { title: `New viral challenge about ${topic}`, link: 'https://trends.google.com' }
      ];
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get('https://serpapi.com/search', {
          params: {
            engine: 'google_trends',
            q: topic,
            api_key: this.serpApiKey,
          },
        })
      );

      // Map results according to SerpApi Google Trends response structure
      return response.data.interest_over_time?.timeline_data || [];
    } catch (error) {
      this.logger.error(`Error fetching trends: ${error.message}`);
      return [];
    }
  }
}
