import { Injectable } from '@nestjs/common';
import { WsGateway } from '../websocket-gateway.gateway';

@Injectable()
export class NotificationDispatcherService {
  constructor(private readonly wsGateway: WsGateway) {}

  async notifyUser(userId: string, data: any) {
    this.wsGateway.sendToUser(userId, data);
  }
}
