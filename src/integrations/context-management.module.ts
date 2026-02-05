import { Module } from '@nestjs/common';
import { ContextManagementService } from './context-management.service';
import { ContextManagementController } from './context-management.controller';

@Module({
  controllers: [ContextManagementController],
  providers: [ContextManagementService],
  exports: [ContextManagementService],
})
export class ContextManagementModule {}