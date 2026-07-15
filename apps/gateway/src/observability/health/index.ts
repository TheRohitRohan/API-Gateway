import packageJson from '../../../package.json';

import { checkRedis } from './redis';
import { checkAllServices } from './services';
import { DependencyHealth, HealthResponse, HealthStatus } from './types';

export const APP_VERSION = packageJson.version;

export async function getGatewayHealth(): Promise<HealthResponse> {
    const [redis, services] = await Promise.all([checkRedis(), checkAllServices()]);

    const dependencies = [redis, ...services];

    return {
        status: determineOverallStatus(dependencies),

        timestamp: new Date().toISOString(),
        uptime: process.uptime(),

        gateway: {
            status: HealthStatus.Up,
            version: APP_VERSION,
            node: process.version,
        },

        dependencies,
    };
}
function determineOverallStatus(dependencies: DependencyHealth[]): HealthStatus {
    if (dependencies.some((d) => d.status === HealthStatus.Down)) {
        return HealthStatus.Down;
    }

    if (dependencies.some((d) => d.status === HealthStatus.Degraded)) {
        return HealthStatus.Degraded;
    }

    return HealthStatus.Up;
}
