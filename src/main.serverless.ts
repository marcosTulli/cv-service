// File: src/main.serverless.ts

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express'; // Import Request and Response types
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from './swagger.config';
import { OpenAPIObject } from '@nestjs/swagger'; // Import OpenAPIObject for explicit typing

export async function createNestApplication() {
  const server = express(); // This is your Express application instance
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  // --- FIX APPLIED HERE ---
  // Register the route directly on the 'server' (Express app) instance,
  // not on the NestJS 'app' (INestApplication) instance.
  server.get('/docs-json', (req: Request, res: Response) => {
    res.json(document);
  });
  // --- END FIX ---

  app.enableCors();
  await app.init();
  return server; // Ensure you still return the 'server' instance for Vercel
}
