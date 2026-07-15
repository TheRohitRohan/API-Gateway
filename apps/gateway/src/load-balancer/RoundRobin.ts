import { ServiceInstance } from '../config/services.js';
import { isHealthy } from '../health-checker/registry.js';
import { logger } from '../logger.js';
import { getCircuitBreaker } from '../resilience/breakers.js';
import { CircuitBreakerOpenError } from '../resilience/CircuitBreaker.js';

export class RoundRobin {
    private currentIndex = 0;

    next(instances: ServiceInstance[]): ServiceInstance {
        if (instances.length === 0) {
            throw new Error('No service instance available.');
        }

        for (let i = 0; i < instances.length; i++) {
            const instance = instances[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % instances.length;

            if (!isHealthy(instance.id)) {
                logger.warn(
                    {
                        instance: instance.id,
                    },
                    'Skipping unhealthy instance(Health Check Failed)',
                );
                continue;
            }

            const breaker = getCircuitBreaker(instance.id);

            if (breaker.isAvailable()) {
                logger.info(
                    {
                        instance: instance.id,
                        target: instance.target,
                    },
                    'Load Balancer selected instance',
                );
                return instance;
            } else {
                logger.warn(
                    {
                        instance: instance.id,
                    },
                    'Skipping unhealthy instance(Circuit Open)',
                );
            }
        }
        logger.error(
            {
                instances: instances.map((i) => i.id),
            },
            'No healthy service instances available',
        );

        throw new CircuitBreakerOpenError();
    }
}
