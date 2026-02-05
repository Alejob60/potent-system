import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreativeSynthesizerCreation } from './entities/creative-synthesizer.entity';
import { CreativeSynthesizerService } from './services/creative-synthesizer.service';
import { CreativeSynthesizerController } from './controllers/creative-synthesizer.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreativeSynthesizerCreation]),
    ClientsModule.register([
      {
        name: 'ServiceBusClient',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.AZURE_SERVICE_BUS_CONNECTION_STRING ||
              'amqp://localhost:5672',
          ],
          queue: process.env.SERVICE_BUS_QUEUE_NAME || 'content_creation_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [CreativeSynthesizerService],
  controllers: [CreativeSynthesizerController],
  exports: [CreativeSynthesizerService],
})
export class AgentCreativeSynthesizerModule {}
