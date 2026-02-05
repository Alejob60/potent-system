import { Module, Global } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: 'MisyConnection',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 
             configService.get<string>('MONGODB_CONNECTION_STRING') || 
             'mongodb://localhost:27017/metaagent_dev',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'DatabaseConnection',
      useFactory: (connection) => connection,
      inject: [getConnectionToken('MisyConnection')],
    },
  ],
  exports: [MongooseModule, 'DatabaseConnection'],
})
export class DatabaseModule {}
