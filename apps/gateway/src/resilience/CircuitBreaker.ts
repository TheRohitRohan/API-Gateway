import { logger } from '../logger';
import { initializeCircuitState, recordCircuitStateChange } from '../observability/metrics';

export const CircuitState = {
    Closed: 'CLOSED',
    Open: 'OPEN',
    HalfOpen: 'HALF_OPEN',
} as const;

export class CircuitBreakerOpenError extends Error {
    constructor() {
        super('Circuit breaker is open');
    }
}

export type CircuitState = (typeof CircuitState)[keyof typeof CircuitState];

export class CircuitBreaker {
    private state: CircuitState = CircuitState.Closed;
    private failures = 0;
    private nextAttempt = 0;
    private trialRequestInProgress = false;

    constructor(
        private readonly service: string,
        private readonly failureThreshold = 5,
        private readonly resetTimeout = 30_000,
    ) {
        initializeCircuitState(this.service);
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (!this.acquirePermission()) {
            throw new CircuitBreakerOpenError();
        }

        try {
            const result = await operation();

            this.onSuccess();

            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private acquirePermission(): boolean {
        switch (this.state) {
            case CircuitState.Closed:
                return true;

            case CircuitState.Open:
                if (Date.now() < this.nextAttempt) {
                    return false;
                }

                this.halfOpenCircuit();
                return true;

            case CircuitState.HalfOpen:
                if (this.trialRequestInProgress) {
                    return false;
                }

                this.trialRequestInProgress = true;
                return true;
        }
        throw new Error('Unknown circuit breaker state');
    }

    private onSuccess(): void {
        switch (this.state) {
            case CircuitState.Closed:
                this.failures = 0;
                return;

            case CircuitState.HalfOpen:
                this.closeCircuit();
                return;

            case CircuitState.Open:
                return;
        }
    }

    private onFailure() {
        if (this.state === CircuitState.HalfOpen) {
            this.openCircuit();
            return;
        }

        if (this.state === CircuitState.Closed) {
            this.failures++;

            if (this.failures >= this.failureThreshold) {
                this.openCircuit();
            }
        }
    }

    private openCircuit(): void {
        this.transitionTo(CircuitState.Open);

        this.failures = 0;
        this.nextAttempt = Date.now() + this.resetTimeout;
        this.trialRequestInProgress = false;
    }

    private closeCircuit(): void {
        this.transitionTo(CircuitState.Closed);

        this.failures = 0;
        this.trialRequestInProgress = false;
    }

    private halfOpenCircuit(): void {
        this.transitionTo(CircuitState.HalfOpen);

        this.trialRequestInProgress = true;
    }

    private transitionTo(state: CircuitState): void {
        if (this.state === state) {
            return;
        }

        const previous = this.state;
        this.state = state;

        logger.warn(
            {
                service: this.service,
                from: previous,
                to: state,
            },
            'Circuit state changed',
        );

        recordCircuitStateChange(this.service, previous, state);
    }

    public isAvailable(): boolean {
        switch (this.state) {
            case CircuitState.Closed:
                return true;

            case CircuitState.HalfOpen:
                return !this.trialRequestInProgress;

            case CircuitState.Open:
                return Date.now() >= this.nextAttempt;
        }
    }
}
