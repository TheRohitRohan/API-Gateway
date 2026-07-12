import { buildApp } from './app.js';
import { config } from './config/index.js';
import { PrismaClient } from './generated/client/index.js';
import { Redis } from 'ioredis';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL,
    },
  },
});

const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 1,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

const app = buildApp(prisma, redis);

const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const shutdown = async () => {
  app.log.info('Shutting down Cart Service...');
  try {
    await app.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
