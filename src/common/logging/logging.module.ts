import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalLoggerService } from './professional-logger.service';
import { ProfessionalLog } from '../../entities/professional-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfessionalLog])],
  providers: [ProfessionalLoggerService],
  exports: [ProfessionalLoggerService],
})
export class LoggingModule {}