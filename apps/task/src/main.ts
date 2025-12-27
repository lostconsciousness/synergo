import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  console.log('🚀 Starting Task Microservice...');
  console.log('📦 Connecting to RabbitMQ at amqp://guest:guest@rabbitmq:5672');
  console.log('📦 Queue: task_queue');
  
  const microserviceOptions: MicroserviceOptions = {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'task_queue',
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    };
  
  let connected = false;
  let retryCount = 0;
    while (!connected) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1} to create microservice...`);
        const app = await NestFactory.createMicroservice<MicroserviceOptions>(
          TaskModule,
          microserviceOptions,
        );
        console.log('✅ Microservice created, starting to listen...');
        await app.listen();
        console.log('✅ Tasks microservice is running on RabbitMQ (task_queue)');
        connected = true;
      } catch (err) {
        retryCount++;
        console.error(`❌ Failed to connect to RabbitMQ (attempt ${retryCount}). Retrying in 5 seconds...`);
        console.error('Error details:', err.message);
        if (err.stack) {
          console.error('Stack trace:', err.stack);
        }
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
}
bootstrap();