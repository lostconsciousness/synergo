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

  const port = parseInt(process.env.PORT, 10) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log('API Gateway is running on http://localhost:3000');
}
bootstrap();
