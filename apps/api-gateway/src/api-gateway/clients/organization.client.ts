import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

export const rmqOrganizationClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://guest:guest@rabbitmq:5672'],
    queue: 'organizations_queue',
    queueOptions: {
      durable: true,
    },
  },
});
