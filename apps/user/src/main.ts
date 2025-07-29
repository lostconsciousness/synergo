import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'user_queue',
      queueOptions: {
        durable: true,
      },
    },
  };

  let connected = false;
  while (!connected) {
    try {
      const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        UserModule,
        microserviceOptions,
      );
      await app.listen();
      console.log('User microservice is running on RabbitMQ (user_queue)');
      connected = true;
    } catch (err) {
      console.error('Failed to connect to RabbitMQ. Retrying in 5 seconds...');
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}
bootstrap();
