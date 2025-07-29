import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export const rmqWsClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://guest:guest@rabbitmq:5672'],
    queue: 'websocket_gateway_queue',
    queueOptions: {
      durable: true,
    },
  },
});
