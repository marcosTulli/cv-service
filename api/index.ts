/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createNestApplication } from '../src/main.serverless';
import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

interface ErrorResponse {
  error: string;
  timestamp: string;
  requestId?: string;
}

let cachedApp: Express | undefined;

function isResponseSent(res: VercelResponse): boolean {
  return res.headersSent || res.writableEnded;
}

function sendErrorResponse(
  res: VercelResponse,
  statusCode: number,
  message: string,
  requestId?: string,
): void {
  if (isResponseSent(res)) {
    console.warn('Attempted to send response after headers were sent');
    return;
  }

  const errorResponse: ErrorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  res.status(statusCode).json(errorResponse);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const requestId = Math.random().toString(36).substring(2, 15);

  try {
    if (!cachedApp) {
      console.log('Initializing NestJS application...');
      cachedApp = await createNestApplication();
      console.log('NestJS application initialized successfully');
    }

    await new Promise<void>((resolve, reject) => {
      const expressReq = req as unknown as IncomingMessage;
      const expressRes = res as unknown as ServerResponse;

      (expressReq as any).requestId = requestId;
      (expressReq as any).timestamp = new Date().toISOString();

      const expressApp = cachedApp as unknown as (
        req: IncomingMessage,
        res: ServerResponse,
        next?: (err?: Error | null) => void,
      ) => void;

      expressApp(expressReq, expressRes, (err?: Error | null) => {
        if (err) {
          console.error(`Express app error [${requestId}]:`, err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error: unknown) {
    console.error(`Handler error [${requestId}]:`, error);

    if (error instanceof Error) {
      sendErrorResponse(res, 500, error.message, requestId);
    } else if (typeof error === 'string') {
      sendErrorResponse(res, 500, error, requestId);
    } else {
      sendErrorResponse(res, 500, 'Internal Server Error', requestId);
    }
  }
}
