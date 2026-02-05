import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEditorController } from './controllers/content-editor.controller';
import { ContentEditorService } from './services/content-editor.service';
import { ContentEditTask } from './entities/content-edit-task.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentEditTask]),
    HttpModule,
  ],
  controllers: [ContentEditorController],
  providers: [ContentEditorService],
  exports: [ContentEditorService],
})
export class ContentEditorModule {}