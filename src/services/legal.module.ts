import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalService } from './legal.service';
import { LegalController, UserController } from './legal.controller';
import { LegalDocument } from '../entities/legal-document.entity';
import { ConsentRecord } from '../entities/consent-record.entity';
import { DataExportRequest } from '../entities/data-export-request.entity';
import { DataDeleteRequest } from '../entities/data-delete-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LegalDocument,
      ConsentRecord,
      DataExportRequest,
      DataDeleteRequest,
    ]),
  ],
  providers: [LegalService],
  controllers: [LegalController, UserController],
  exports: [LegalService],
})
export class LegalModule {}