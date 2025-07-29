import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './services/organization.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { OrganizationMemberService } from './services/organization-member.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { OrgInvite } from './entities/org-invite.entity';
import { InviteService } from './services/invites.service';

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
            entities: [Organization, OrganizationMember, Role, Permission, OrgInvite],
            synchronize: true,
        }),
    }), 


    TypeOrmModule.forFeature([Organization, OrganizationMember, Role, Permission, OrgInvite]),

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

    ClientsModule.register([
      {
        name: 'WEBSOCKET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'],
          queue: 'websocket_gateway_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationMemberService, RoleService, PermissionService, InviteService],
})
export class OrganizationModule {}
