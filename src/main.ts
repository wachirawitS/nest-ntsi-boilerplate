import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('NTSI Nest Boilerplate API')
      .setDescription('Modular monolith backend API reference')
      .setVersion('0.0.1')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
    });
  }

  await app.listen(process.env.APP_PORT ?? 3000);
}
void bootstrap();
