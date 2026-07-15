import { client, register } from './registry.js';

const httpRequestsTotal = new client.Counter({
    name: 'gateway_http_requests_total',
    help: 'Total HTTP requests handled by the gateway',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

const httpRequestDuration = new client.Histogram({
    name: 'gateway_http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});

const activeRequests = new client.Gauge({
    name: 'gateway_active_requests',
    help: 'Current active requests',
    registers: [register],
});

let activeRequestCount = 0;

export function incrementActiveRequests() {
    activeRequestCount++;
    activeRequests.inc();
}

export function decrementActiveRequests() {
    activeRequestCount--;
    activeRequests.dec();
}

export function getActiveRequestCount() {
    return activeRequestCount;
}

export function startHttpRequestTimer(method: string, route: string) {
    return httpRequestDuration.startTimer({
        method,
        route,
    });
}

export function recordHttpRequest(method: string, route: string, status: number) {
    httpRequestsTotal.inc({
        method,
        route,
        status: String(status),
    });
}
