import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';

export function meRoutes(app: FastifyInstance): void {
  // Example protected route: returns the current Clerk user id.
  app.get('/me', async (request, reply) => {
    const { userId } = getAuth(request);

    if (!userId) {
      return reply.unauthorized('You must be signed in to access this resource.');
    }

    return { userId };
  });
}
