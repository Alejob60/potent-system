import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InstagramDmService } from './instagram-dm.service';
import { InstagramDmController } from './instagram-dm.controller';

@Module({
  imports: [HttpModule],
  controllers: [InstagramDmController],
  providers: [InstagramDmService],
  exports: [InstagramDmService],
})
export class InstagramDmModule {}