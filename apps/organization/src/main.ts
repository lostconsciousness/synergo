import { NestFactory } from '@nestjs/core';
import { OrganizationModule } from './organization.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const microserviceOptions: MicroserviceOptions = {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'organizations_queue',
        queueOptions: {
          durable: true,
        },
      },
    };
  
  let connected = false;
    while (!connected) {
      try {
        const app = await NestFactory.createMicroservice<MicroserviceOptions>(
          OrganizationModule,
          microserviceOptions,
        );
        await app.listen();
        console.log('Organizations microservice is running on RabbitMQ (organizations_queue)');
        connected = true;
      } catch (err) {
        console.error('Failed to connect to RabbitMQ. Retrying in 5 seconds...');
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
}
bootstrap();
