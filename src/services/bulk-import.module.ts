import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BulkImportService } from './bulk-import.service';
import { BulkImportController } from './bulk-import.controller';
import { Customer } from '../entities/customer.entity';
import { ImportJob } from '../entities/import-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, ImportJob]),
  ],
  providers: [BulkImportService],
  controllers: [BulkImportController],
  exports: [BulkImportService],
})
export class BulkImportModule {}