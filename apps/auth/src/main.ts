// apps/auth/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: true,
      },
    },
  };

  let connected = false;
  while (!connected) {
    try {
      const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        microserviceOptions,
      );
      await app.listen();
      console.log('✅ Auth microservice is running on RabbitMQ (auth_queue)');
      connected = true;
    } catch (err) {
      console.error('❌ Failed to connect to RabbitMQ. Retrying in 5 seconds...');
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}
bootstrap();
