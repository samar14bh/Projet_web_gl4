import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'reflect-metadata';

import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: 'http://localhost:4200', // URL de ton frontend Angular
    credentials: true,
  });
 app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Club Management API')
    .setDescription(
      'API de gestion des clubs, événements, adhésions et paiements',
    )
    .setVersion('1.0')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('clubs', 'Gestion des clubs')
    .addTag('events', 'Gestion des événements')
    .addTag('memberships', 'Gestion des adhésions')
    .addTag('payments', 'Gestion des paiements')
    .addTag('documents', 'Gestion des documents')
    .addTag('notifications', 'Gestion des notifications')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API endpoints available at: http://localhost:${port}/api`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
