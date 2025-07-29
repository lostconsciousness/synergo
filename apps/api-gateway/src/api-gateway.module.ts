import { Module } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiModule } from './api-gateway/api.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './api-gateway/guards/jwt-auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..','uploads'),
      serveRoot: '/uploads',
    }),

    ApiModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [ApiGatewayService, JwtAuthGuard],
  exports: [ApiGatewayService, JwtAuthGuard],
})
export class ApiGatewayModule {}
