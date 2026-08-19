import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { clerkPlugin } from '@clerk/fastify';
import { env } from './env.js';
import { healthRoutes } from './routes/health.js';
import { meRoutes } from './routes/me.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
  });

  // Utility helpers (app.httpErrors, etc.)
  app.register(sensible);

  // Allow the Next.js frontend to call this API with credentials
  app.register(cors, {
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  });

  // Attaches Clerk auth to every request (reads the session token)
  app.register(clerkPlugin, {
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  });

  // Routes
  app.register(healthRoutes);
  app.register(meRoutes, { prefix: '/api' });

  return app;
}
