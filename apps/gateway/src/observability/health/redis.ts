import { performance } from 'node:perf_hooks';

import { redis } from '../../redis/client';
import { HealthStatus, RedisHealth } from './types';

export async function checkRedis(): Promise<RedisHealth> {
    const start = performance.now();

    try {
        await redis.ping();

        return {
            name: 'redis',
            status: HealthStatus.Up,
            responseTime: Number((performance.now() - start).toFixed(2)),
        };
    } catch (error) {
        return {
            name: 'redis',
            status: HealthStatus.Down,
            responseTime: Number((performance.now() - start).toFixed(2)),
            message:
                error instanceof Error
                    ? error.cause instanceof Error
                        ? error.cause.message
                        : error.message
                    : 'Unknown error',
        };
    }
}
