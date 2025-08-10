import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const microserviceOptions: MicroserviceOptions = {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'task_queue',
        queueOptions: {
          durable: true,
        },
      },
    };
  
  let connected = false;
    while (!connected) {
      try {
        const app = await NestFactory.createMicroservice<MicroserviceOptions>(
          TaskModule,
          microserviceOptions,
        );
        await app.listen();
        console.log('Tasks microservice is running on RabbitMQ (task_queue)');
        connected = true;
      } catch (err) {
        console.error('Failed to connect to RabbitMQ. Retrying in 5 seconds...');
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
}
bootstrap();
