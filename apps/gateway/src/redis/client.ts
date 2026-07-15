import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6380';

export const redis = createClient({
    url: redisUrl,
});

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect();
        console.log(`Redis connected (${redisUrl})`);
    }
}
