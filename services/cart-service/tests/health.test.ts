import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { PrismaClient } from '../src/generated/client/index.js';
import Redis from 'ioredis';

describe('Cart Service Health Check', () => {
  let app: any;

  beforeAll(() => {
    const mockPrisma = {} as PrismaClient;
    const mockRedis = {} as Redis;
    app = buildApp(mockPrisma, mockRedis);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 healthy status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ status: 'healthy' });
  });

  it('should return service version information', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/version',
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      service: 'cart-service',
      version: '1.0.0',
    });
  });
});
