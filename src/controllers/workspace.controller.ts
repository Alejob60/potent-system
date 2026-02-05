import { Controller, Get, Post, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceService } from '../services/workspace.service';
import { Workspace } from '../schemas/workspace.schema';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('workspace')
@ApiBearerAuth()
@Controller('workspace')
@UseGuards(AuthGuard('jwt'))
export class WorkspaceController {
  private readonly logger = new Logger(WorkspaceController.name);

  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync workspace state (nodes, edges, viewport)' })
  async sync(@Request() req, @Body() workspaceData: Partial<Workspace>) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    this.logger.log(`Sync request for user ${userId} and tenant ${tenantId}`);
    
    // Merge tenantId if not present in body
    const dataToSync = {
      ...workspaceData,
      tenantId: workspaceData.tenantId || tenantId,
    };
    
    return this.workspaceService.sync(userId, dataToSync);
  }

  @Get('state')
  @ApiOperation({ summary: 'Get current workspace state' })
  async getState(@Request() req) {
    const userId = req.user.userId;
    this.logger.log(`State request for user ${userId}`);
    return this.workspaceService.load(userId);
  }
}
