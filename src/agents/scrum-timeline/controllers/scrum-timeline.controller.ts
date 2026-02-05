import { Controller, Post, Body } from '@nestjs/common';
import { ScrumTimelineService } from '../services/scrum-timeline.service';
// Swagger imports
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SyncResult } from '../interfaces/sync-result.interface';

@ApiTags('calendar')
@Controller('calendar/scrum-sync')
export class ScrumTimelineController {
  constructor(private readonly service: ScrumTimelineService) {}

  @Post()
  @ApiOperation({
    summary: 'Sincroniza tareas en el calendario',
    description: 'Carga y coordina tareas en el calendario del equipo',
  })
  @ApiBody({
    description: 'Datos para sincronizaci n de tareas en calendario',
    schema: {
      type: 'object',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              assignee: { type: 'string' },
            },
          },
        },
        agents: {
          type: 'array',
          items: { type: 'string' },
          example: ['trend-scanner', 'video-scriptor'],
        },
        sessionId: { type: 'string', example: 'user-session-123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tareas sincronizadas exitosamente en calendario',
  })
  @ApiResponse({ status: 400, description: 'Datos inv lidos' })
  async syncScrumTimeline(@Body() calendarData: any): Promise<{
    status: string;
    message: string;
    syncResults: SyncResult[];
    agentStatus: any;
    oauthStatus: any;
    timestamp: string;
  }> {
    return this.service.syncScrumTimeline(calendarData);
  }
}
