import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './services/task.service';
import { BoardService } from './services/board.service';
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
            host: config.get('DB_HOST'),
            port: Number(config.get('DB_PORT')),
            username: config.get('DB_USERNAME'),
            password: config.get('DB_PASSWORD'),
            database: config.get('DB_NAME'),
            entities: [Board, ColumnEntity, Task],
            synchronize: true,
        }),
    }), 


    TypeOrmModule.forFeature([Board, ColumnEntity, Task]),

    ClientsModule.register([
      {
        name: 'ORG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'organizations_service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, BoardService],
})
export class TaskModule {}
