export const HealthStatus = {
    Up: 'UP',
    Down: 'DOWN',
    Degraded: 'DEGRADED',
} as const;

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];

export interface InstanceHealth {
    id: string;
    target: string;
    status: HealthStatus;
    responseTime: number;
    message?: string;
}

export interface RedisHealth {
    name: 'redis';
    status: HealthStatus;
    responseTime: number;
    message?: string;
}

export interface ServiceHealth {
    name: string;
    status: HealthStatus;
    instances: InstanceHealth[];
}

export type DependencyHealth = RedisHealth | ServiceHealth;

export interface HealthResponse {
    status: HealthStatus;
    timestamp: string;
    uptime: number;

    gateway: {
        status: HealthStatus;
        version: string;
        node: string;
    };

    dependencies: DependencyHealth[];
}
