import { CircuitBreaker } from './CircuitBreaker.js';

const breakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(service: string): CircuitBreaker {
    let breaker = breakers.get(service);

    if (!breaker) {
        breaker = new CircuitBreaker(service);
        breakers.set(service, breaker);
    }

    return breaker;
}
