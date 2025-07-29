import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client.id);
      console.log(`User ${userId} connected via socket ${client.id}`);
    }
  }

  sendToUser(userId: string, payload: any) {
    const socketId = this.clients.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', payload);
    }
  }
}
