import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todo.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
   
    ConfigModule.forRoot({
      isGlobal: true,
    }),
   
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('✅ MongoDB connected successfully'));
          connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TodosModule
  ],
})
export class AppModule {}