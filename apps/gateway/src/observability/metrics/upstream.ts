import { client, register } from './registry.js';
import { UpstreamFailureReason } from './types.js';

const upstreamRequestsTotal = new client.Counter({
    name: 'gateway_upstream_requests_total',
    help: 'Total requests sent to upstream services',
    labelNames: ['service', 'instance', 'method', 'status'],
    registers: [register],
});

const upstreamFailuresTotal = new client.Counter({
    name: 'gateway_upstream_failures_total',
    help: 'Total upstream request failures',
    labelNames: ['service', 'instance', 'reason'],
    registers: [register],
});

const upstreamRequestDuration = new client.Histogram({
    name: 'gateway_upstream_request_duration_seconds',
    help: 'Duration of upstream requests',
    labelNames: ['service', 'instance', 'method', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});

export function recordUpstreamRequest(
    service: string,
    instance: string,
    method: string,
    status: number,
) {
    upstreamRequestsTotal.inc({
        service,
        instance,
        method,
        status: String(status),
    });
}

export function recordUpstreamFailure(
    service: string,
    instance: string,
    reason: UpstreamFailureReason,
) {
    upstreamFailuresTotal.inc({
        service,
        instance,
        reason,
    });
}

export function startUpstreamRequestTimer(service: string, instance: string, method: string) {
    return upstreamRequestDuration.startTimer({
        service,
        instance,
        method,
    });
}
