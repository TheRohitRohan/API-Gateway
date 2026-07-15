import { client, register } from './registry.js';

const rateLimitedTotal = new client.Counter({
    name: 'gateway_rate_limited_total',
    help: 'Total requests rejected by the rate limiter',
    labelNames: ['service'],
    registers: [register],
});

export function recordRateLimited(service: string) {
    rateLimitedTotal.inc({
        service,
    });
}
