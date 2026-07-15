export const UpstreamFailureReason = {
    Timeout: 'timeout',
    CircuitOpen: 'circuit_open',
    RetryExhausted: 'retry_exhausted',
    Upstream5xx: 'upstream_5xx',
    Unknown: 'unknown',
} as const;

export type UpstreamFailureReason =
    (typeof UpstreamFailureReason)[keyof typeof UpstreamFailureReason];

export const CircuitMetricState = {
    Closed: 0,
    HalfOpen: 1,
    Open: 2,
} as const;

export const RetryReason = {
    Timeout: 'timeout',
    Network: 'network',
    Http5xx: 'http_5xx',
    Unknown: 'unknown',
} as const;
