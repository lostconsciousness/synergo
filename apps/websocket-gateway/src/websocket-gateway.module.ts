import { Module } from '@nestjs/common';
import { WebsocketGatewayController } from './websocket-gateway.controller';
import { WebsocketGatewayService } from './services/websocket-gateway.service';
import { WsGateway } from './websocket-gateway.gateway';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { RmqEventHandler } from './events/websocket-gateway.events';

@Module({
  imports: [],
  controllers: [WebsocketGatewayController, RmqEventHandler],
  providers: [WebsocketGatewayService, WsGateway, NotificationDispatcherService],
})
export class WebsocketGatewayModule {}
