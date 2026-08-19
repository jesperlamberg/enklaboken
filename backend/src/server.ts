import { buildApp } from './app.js';
import { env } from './env.js';

const app = buildApp();

async function start(): Promise<void> {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down…`);
    await app.close();
    process.exit(0);
  });
}

void start();
