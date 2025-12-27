import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './services/task.service';
import { BoardService } from './services/board.service';
import { ColumnService } from './services/column.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { ColumnEntity } from './entities/column.entity';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get('DB_HOST') || 'postgres',
            port: Number(config.get('DB_PORT')) || 5432,
            username: config.get('DB_USERNAME') || 'postgres',
            password: config.get('DB_PASSWORD') || 'postgres',
            database: config.get('DB_NAME') || 'synergo',
            entities: [Board, ColumnEntity, Task],
            synchronize: true,
            retryAttempts: 5,
            retryDelay: 3000,
        }),
    }), 


    TypeOrmModule.forFeature([Board, ColumnEntity, Task]),

    ClientsModule.register([
      {
        name: 'ORG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'organizations_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, BoardService, ColumnService],
})
export class TaskModule {}
