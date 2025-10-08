import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();

import {ExpressAdapter,NestExpressApplication} from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  app.setGlobalPrefix('api');
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
  SwaggerModule.setup('api', app, document,{
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      tagsSorter: 'alpha', 
      operationsSorter: 'alpha',
    }
  });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json()); 
  app.enableCors({
  origin: ['http://localhost:3000','https://lah-dashboard-xzp3.vercel.app'],
  credentials: true,
});
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();