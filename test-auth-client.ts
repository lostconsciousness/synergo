import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('Создание клиента...');
  const client: ClientProxy = ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: { durable: true },
    },
  });

  console.log('Подключение клиента...');
  await client.connect();
  console.log('Клиент подключён ✅');

  try {
    console.log('Отправка запроса...');
    const response = await client.send('auth_register', {
      email: 'test@example.com',
      password: '12345678',
      fullName: 'Test User',
    }).toPromise();

    console.log('Ответ от auth_register:', response);
    } catch (err) {
        console.error('❌ Ошибка при запросе:', err?.message || err);
    }
}

bootstrap();
