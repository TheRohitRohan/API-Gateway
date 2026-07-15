import { performance } from 'node:perf_hooks';

import { services } from '../../config/services';
import { HealthStatus, InstanceHealth, ServiceHealth } from './types';

async function checkService(service: (typeof services)[number]): Promise<ServiceHealth> {
    const instances = await Promise.all(
        service.instances.map(async (instance): Promise<InstanceHealth> => {
            const start = performance.now();

            try {
                const response = await fetch(`${instance.target}/health`, {
                    signal: AbortSignal.timeout(1000),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return {
                    id: instance.id,
                    target: instance.target,
                    status: HealthStatus.Up,
                    responseTime: Number((performance.now() - start).toFixed(2)),
                };
            } catch (error) {
                return {
                    id: instance.id,
                    target: instance.target,
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
        }),
    );

    const upCount = instances.filter((instance) => instance.status === HealthStatus.Up).length;

    let status: HealthStatus;

    if (upCount === instances.length) {
        status = HealthStatus.Up;
    } else if (upCount === 0) {
        status = HealthStatus.Down;
    } else {
        status = HealthStatus.Degraded;
    }

    return {
        name: service.name,
        status,
        instances,
    };
}

export async function checkAllServices(): Promise<ServiceHealth[]> {
    return Promise.all(services.map(checkService));
}
