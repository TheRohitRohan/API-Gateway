import { checkRateLimit } from '../services/rateLimiter.js';
import { GatewayRequest } from '../types/gateway.js';
import { Middleware } from './types.js';
import { recordRateLimited } from '../observability/metrics';

export const rateLimiter: Middleware = async (request, reply, next) => {
    const gatewayRequest = request as GatewayRequest;
    const key = gatewayRequest.user?.id ?? request.ip;

    const result = await checkRateLimit(key);

    reply.header('X-RateLimit-Limit', '5');
    reply.header('X-RateLimit-Remaining', result.remaining.toString());
    reply.header('X-RateLimit-Reset', result.reset.toString());

    if (!result.allowed) {
        recordRateLimited(gatewayRequest.service?.name ?? 'gateway');

        reply.status(429).send({
            error: 'Too Many Requests',
        });

        return;
    }

    await next();
};

// const requests = new Map<
//     string,
//     {
//         count: number;
//         resetTime: number;
//     }
// >();

// export const rateLimiter: Middleware = async (request, reply, next) => {
//     const ip = request.ip;
//     const now = Date.now();

//     let entry = requests.get(ip);

//     if (!entry || now > entry.resetTime) {
//         entry = {
//             count: 0,
//             resetTime: now + rateLimitConfig.windowMs,
//         };

//         requests.set(ip, entry);
//     }

//     entry.count++;

//     if (entry.count > rateLimitConfig.maxRequests) {
//         reply.status(429).send({
//             error: "Too Many Request",
//         });

//         return;
//     }

//     await next();
// };
