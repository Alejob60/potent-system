import { Controller, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrchestratorService } from '../services/orchestrator.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orchestrator')
@ApiBearerAuth()
@Controller('orchestrator')
@UseGuards(AuthGuard('jwt'))
export class OrchestratorController {
  private readonly logger = new Logger(OrchestratorController.name);

  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post('process')
  @ApiOperation({ summary: 'Main orchestrator endpoint for MetaOS' })
  async process(@Request() req, @Body() body: { message: string }) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    const token = req.headers.authorization.split(' ')[1]; // Extraemos el token original

    this.logger.log(`Processing MetaOS request for user: ${userId}`);

    return this.orchestratorService.processInteractiveIntent({
      userId,
      tenantId,
      message: body.message,
      token
    });
  }
}
