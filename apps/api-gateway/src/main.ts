import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  const config = new DocumentBuilder()
    .setTitle('Название API')
    .setDescription('Описание API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document)

  await app.listen(3000);
  console.log('API Gateway is running on http://localhost:3000');
}
bootstrap();
