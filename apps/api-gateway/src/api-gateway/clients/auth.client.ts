import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export const rmqAuthClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://guest:guest@rabbitmq:5672'],
    queue: 'auth_queue',
    queueOptions: {
      durable: true,
    },
  },
});
