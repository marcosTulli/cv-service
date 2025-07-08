import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import { createNestApplication } from '../src/main.serverless';
import type { Express } from 'express';

type ServerlessHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => Promise<void>;

let cachedHandler: ServerlessHandler | undefined;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    if (!cachedHandler) {
      const expressApp: Express = await createNestApplication();

      // Cast the serverlessExpress output to the known handler type
      cachedHandler = serverlessExpress({
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        app: expressApp,
      }) as unknown as ServerlessHandler;
    }
    await cachedHandler(req, res);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Handler error:', error.message);
      void res.status(500).send(error.message);
      return;
    }
    console.error('Handler error:', error);
    void res.status(500).send('Internal Server Error');
  }
}
