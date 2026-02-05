import { Module } from '@nestjs/common';
import { ContextStoreService } from './context-store.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextBundle } from '../../entities/context-bundle.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([ContextBundle]),
  ],
  providers: [ContextStoreService],
  exports: [ContextStoreService],
})
export class ContextStoreModule {}