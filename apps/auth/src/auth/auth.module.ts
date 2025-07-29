import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUser } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { RefreshTokenService } from './refresh-token.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrgRefreshTokenService } from './org-refresh-token.service';

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
            entities: [AuthUser],
            synchronize: true,
        }),
    }), 


    TypeOrmModule.forFeature([AuthUser]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
      }),
    }),

    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'user_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),

  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService, OrgRefreshTokenService],
  exports: [AuthService, RefreshTokenService, OrgRefreshTokenService],
})
export class AuthModule {}

