import { InstanceHealth } from './types.js';

const registry = new Map<string, InstanceHealth>();

export function setHealthy(id: string, healthy: boolean) {
    registry.set(id, {
        healthy,
        lastChecked: Date.now(),
    });
}

export function isHealthy(id: string): boolean {
    const status = registry.get(id);

    if (!status) {
        return true;
    }

    return status.healthy;
}

export function getHealthStatus() {
    return registry;
}
