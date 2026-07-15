import { redis } from '../redis/client.js';
import { rateLimitConfig } from '../config/rateLimit.js';

export async function checkRateLimit(key: string) {
    const rediskey = `rate-limit:${key}`;

    let requests = await redis.incr(rediskey);

    if (requests === 1) {
        await redis.expire(rediskey, Math.ceil(rateLimitConfig.windowMs / 1000));
    }

    const ttl = await redis.ttl(rediskey);

    return {
        allowed: requests <= rateLimitConfig.maxRequests,
        remaining: Math.max(0, rateLimitConfig.maxRequests - requests),
        reset: ttl,
    };
}
