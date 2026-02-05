import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CreativeSynthesizerIntegrationService {
  constructor(private readonly httpService: HttpService) {}

  async sendToCreativeSynthesizer(payload: any): Promise<any> {
    try {
      // Enviar la solicitud al Creative Synthesizer Agent
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.BACKEND_URL}/api/agents/creative-synthesizer`,
          payload,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to send request to Creative Synthesizer: ${error.message}`,
      );
    }
  }

  async checkCreationStatus(creationId: string): Promise<any> {
    try {
      // Verificar el estado de una creaci n espec fica
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.BACKEND_URL}/api/agents/creative-synthesizer/${creationId}`,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to check creation status: ${error.message}`);
    }
  }

  async getCreationsBySession(sessionId: string): Promise<any> {
    try {
      // Obtener todas las creaciones de una sesi n
      const response = await firstValueFrom(
        this.httpService.get(
          `${process.env.BACKEND_URL}/api/agents/creative-synthesizer/session/${sessionId}`,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get creations by session: ${error.message}`);
    }
  }
}
