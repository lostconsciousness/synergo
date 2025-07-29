import { NestFactory } from '@nestjs/core';
import { WebsocketGatewayModule } from './websocket-gateway.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(WebsocketGatewayModule);

  const microserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'websocket_gateway_queue',
      queueOptions: {
        durable: true,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);

  let connected = false;
  while (!connected) {
    try {
      await app.startAllMicroservices();
      connected = true;
      console.log('✅ RMQ connected');
    } catch (err) {
      console.error('❌ Failed to connect to RabbitMQ, retrying in 5s...');
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  await app.listen(3003);
  console.log('🚀 WebSocket Gateway running on port 3003');
}
bootstrap();
