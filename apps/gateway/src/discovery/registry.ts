import { ServiceConfig, ServiceInstance } from '../config/services.js';

const registry = new Map<string, ServiceConfig>();

export function registerService(service: ServiceConfig) {
    registry.set(service.name, service);
}

export function unregisterService(name: string) {
    registry.delete(name);
}
export function getRegistry() {
    return registry;
}

export function getService(name: string) {
    return registry.get(name);
}

export function getServices(): ServiceConfig[] {
    return [...registry.values()];
}

export function registerInstance(serviceName: string, instance: ServiceInstance) {
    const service = registry.get(serviceName);

    if (!service) {
        throw new Error(`Service '${serviceName}' not found`);
    }

    service.instances.push(instance);
}

export function unregisterInstance(serviceName: string, instanceId: string) {
    const service = registry.get(serviceName);

    if (!service) {
        return;
    }

    service.instances = service.instances.filter((instance) => instance.id !== instanceId);
}
