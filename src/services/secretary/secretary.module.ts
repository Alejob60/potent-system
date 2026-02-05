import { Module } from '@nestjs/common';
import { SecretaryService } from './secretary.service';
import { SecretaryController } from '../../controllers/secretary.controller';
import { VectorMemoryModule } from '../memory/vector-memory.module';
import { AuthModule } from '../../auth/auth.module';
import { AzureClient } from '../../lib/api/azure-client';

@Module({
  imports: [VectorMemoryModule, AuthModule],
  controllers: [SecretaryController],
  providers: [SecretaryService, AzureClient],
  exports: [SecretaryService]
})
export class SecretaryModule {}