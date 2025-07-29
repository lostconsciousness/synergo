import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationDispatcherService } from '../services/notification-dispatcher.service';
import { UserNotifyDto } from '../dto/user-notify.dto';

@Controller()
export class RmqEventHandler {
  constructor(private readonly dispatcher: NotificationDispatcherService) {}

  @EventPattern('user.notify')
  handleNotification(@Payload() data: UserNotifyDto) {
    this.dispatcher.notifyUser(data.userId, {
      title: data.title,
      message: data.message,
      token: data.token,
    });
  }
}
