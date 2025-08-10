import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
@Injectable()
export class WebsocketGatewayService {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGatewayService.name);

  constructor(
    @Inject('ORGANIZATION_SERVICE') private readonly orgClient: ClientProxy,
    @Inject('TASK_SERVICE') private readonly taskClient: ClientProxy,
  ) {}

  @SubscribeMessage('join_board')
  async handleJoinBoard(
    @MessageBody() data: { boardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.boardId);
    this.logger.log(`User ${client.id} joined board ${data.boardId}`);
    client.emit('joined_board', { boardId: data.boardId });
  }

  @SubscribeMessage('move_task')
  async handleMoveTask(
    @MessageBody() payload: {
      taskId: string;
      fromColumnId: string;
      toColumnId: string;
      newPosition: number;
      boardId: string;
      userId: string;
      organizationId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const hasPerm = await this.orgClient
        .send<boolean>('organization_hasPermission', {
          userId: payload.userId,
          organizationId: payload.organizationId,
          permission: 'task:move',
        })
        .toPromise();

      if (!hasPerm) {
        return client.emit('error', { message: 'Access denied' });
      }

      const updatedTask = await this.taskClient
        .send('task_move', payload)
        .toPromise();

      this.server.to(payload.boardId).emit('task_moved', updatedTask);
    } catch (error) {
      this.logger.error('Error moving task:', error);
      client.emit('error', { message: 'Failed to move task' });
    }
  }

  @SubscribeMessage('move_column')
  async handleMoveColumn(
    @MessageBody() payload: {
      columnId: string;
      boardId: string;
      newPosition: number;
      userId: string;
      organizationId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const hasPerm = await this.orgClient
        .send<boolean>('organization_hasPermission', {
          userId: payload.userId,
          organizationId: payload.organizationId,
          permission: 'column:update',
        })
        .toPromise();

      if (!hasPerm) {
        return client.emit('error', { message: 'Access denied' });
      }

      const updatedColumns = await this.taskClient
        .send('column_move', payload)
        .toPromise();

      this.server.to(payload.boardId).emit('column_moved', updatedColumns);
    } catch (error) {
      this.logger.error('Error moving column:', error);
      client.emit('error', { message: 'Failed to move column' });
    }
  }
}
