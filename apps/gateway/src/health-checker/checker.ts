import { getServices } from '../discovery/registry.js';
import { setHealthy } from './registry.js';

async function checkInstance(id: string, target: string) {
    try {
        const response = await fetch(`${target}/health`);

        setHealthy(id, response.ok);
    } catch {
        setHealthy(id, false);
    }
}

export async function runHealthChecks() {
    const checks = [];
    const services = getServices();

    for (const service of services) {
        for (const instance of service.instances) {
            checks.push(checkInstance(instance.id, instance.target));
        }
    }

    await Promise.all(checks);
}

export function startHealthChecker() {
    runHealthChecks();

    setInterval(runHealthChecks, 5000);
}
