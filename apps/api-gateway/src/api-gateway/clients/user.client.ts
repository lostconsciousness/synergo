import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export const rmqUserClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://guest:guest@rabbitmq:5672'],
    queue: 'user_queue',
    queueOptions: {
      durable: true,
    },
  },
});
