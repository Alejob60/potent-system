import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceController } from '../controllers/workspace.controller';
import { WorkspaceService } from '../services/workspace.service';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Workspace.name, schema: WorkspaceSchema }],
      'MisyConnection',
    ),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
