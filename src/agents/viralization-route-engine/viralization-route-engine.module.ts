import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ViralizationRoute } from './entities/viralization-route.entity';
import { ViralizationRouteEngineService } from './services/viralization-route-engine.service';
import { ViralizationRouteEngineController } from './controllers/viralization-route-engine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ViralizationRoute]), HttpModule],
  providers: [ViralizationRouteEngineService],
  controllers: [ViralizationRouteEngineController],
  exports: [ViralizationRouteEngineService],
})
export class ViralizationRouteEngineModule {}
