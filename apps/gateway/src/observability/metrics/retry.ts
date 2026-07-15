import { client, register } from './registry.js';

const retryTotal = new client.Counter({
    name: 'gateway_retry_total',
    help: 'Total retry attempts',
    labelNames: ['service', 'instance', 'reason'],
    registers: [register],
});

export function recordRetry(service: string, instance: string, reason: string) {
    retryTotal.inc({
        service,
        instance,
        reason,
    });
}
