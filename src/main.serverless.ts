import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from './swagger.config';

export async function createNestApplication() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  await app.init();
  return server;
}
