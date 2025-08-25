import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
// import * as crypto from 'crypto';
// (global as any).crypto = crypto;

import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  const config = new DocumentBuilder()
    .setTitle('API Docs')
    .setDescription('NestJS API endpoints')
    .setVersion('1.0')
    .addSecurity('access-token', {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
