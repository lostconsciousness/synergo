import { Module } from '@nestjs/common';
import { WebsocketGatewayController } from './websocket-gateway.controller';
import { WebsocketGatewayService } from './services/websocket-gateway.service';
import { WsGateway } from './websocket-gateway.gateway';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { RmqEventHandler } from './events/websocket-gateway.events';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORGANIZATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
          queue: 'organizations_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'TASK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
          queue: 'task_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [WebsocketGatewayController, RmqEventHandler],
  providers: [WebsocketGatewayService, WsGateway, NotificationDispatcherService],
})
export class WebsocketGatewayModule {}
