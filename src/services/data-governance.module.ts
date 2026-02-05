import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataGovernanceService } from './data-governance.service';
import { DataGovernanceController } from './data-governance.controller';

@Module({
  imports: [HttpModule],
  providers: [DataGovernanceService],
  controllers: [DataGovernanceController],
  exports: [DataGovernanceService],
})
export class DataGovernanceModule {}