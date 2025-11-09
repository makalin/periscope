import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { claimsRoutes } from './routes/claims';
import { leaderboardRoutes } from './routes/leaderboard';
import { analyticsRoutes } from './routes/analytics';
import { healthRoutes } from './routes/health';

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
async function build() {
  await server.register(helmet);
  await server.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  });
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Register routes
  await server.register(healthRoutes);
  await server.register(claimsRoutes, { prefix: '/v1/claims' });
  await server.register(leaderboardRoutes, { prefix: '/v1/leaderboard' });
  await server.register(analyticsRoutes, { prefix: '/v1/analytics' });

  return server;
}

async function start() {
  try {
    const app = await build();
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  start();
}

export { build, start };

