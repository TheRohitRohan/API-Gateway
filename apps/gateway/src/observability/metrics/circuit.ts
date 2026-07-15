import { CircuitState } from '../../resilience/CircuitBreaker.js';
import { client, register } from './registry.js';
import { CircuitMetricState } from './types.js';

const circuitState = new client.Gauge({
    name: 'gateway_circuit_state',
    help: 'Current circuit breaker state',
    labelNames: ['service'],
    registers: [register],
});

const circuitTransitionsTotal = new client.Counter({
    name: 'gateway_circuit_transitions_total',
    help: 'Total circuit breaker state transitions',
    labelNames: ['service', 'from', 'to'],
    registers: [register],
});

export function recordCircuitStateChange(
    service: string,
    previous: CircuitState,
    current: CircuitState,
): void {
    circuitState.set({ service }, toCircuitMetricState(current));

    circuitTransitionsTotal.inc({
        service,
        from: previous,
        to: current,
    });
}

function toCircuitMetricState(state: CircuitState): number {
    switch (state) {
        case CircuitState.Closed:
            return CircuitMetricState.Closed;

        case CircuitState.HalfOpen:
            return CircuitMetricState.HalfOpen;

        case CircuitState.Open:
            return CircuitMetricState.Open;
    }
}

export function initializeCircuitState(service: string): void {
    circuitState.set({ service }, CircuitMetricState.Closed);
}
