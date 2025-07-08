import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from './swagger.config';
import { OpenAPIObject } from '@nestjs/swagger';

export async function createNestApplication() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  server.get('/docs-json', (req: Request, res: Response) => {
    res.json(document);
  });

  app.enableCors();
  await app.init();
  return server;
}
