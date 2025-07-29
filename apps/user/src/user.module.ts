import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
        entities: [User],
        synchronize: true,
      }),
    }), 


    TypeOrmModule.forFeature([User]),

    ClientsModule.register([
          {
            name: 'AUTH_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@rabbitmq:5672'],
              queue: 'auth_queue',
              queueOptions: {
                durable: true,
              },
            },
          },
        ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
