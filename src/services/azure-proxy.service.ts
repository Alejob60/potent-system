import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureProxyService {
  private readonly logger = new Logger(AzureProxyService.name);
  private readonly azureBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.azureBaseUrl = this.configService.get<string>('AZURE_BACKEND_URL') || 'http://localhost:8080';
  }

  /**
   * Proxies calls to the Main Azure Backend injecting the original user token
   */
  async callAzureEndpoint(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data: any = null,
    userToken: string,
  ): Promise<any> {
    const url = `${this.azureBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    
    this.logger.log(`Proxying ${method.toUpperCase()} request to Azure: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      return response.data;
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data || error.message;
      
      this.logger.error(`Azure Proxy Error [${status}]: ${JSON.stringify(message)}`);
      throw new HttpException(message, status);
    }
  }
}
