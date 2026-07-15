function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
    maxAttempts: number;
    baseDelay: number;

    shouldRetry: (error: unknown) => boolean;

    onRetry?: (attempt: number, error: unknown, delay: number) => void;
}

export class RetryableHttpError extends Error {
    constructor(public readonly response: Response) {
        super(`HTTP ${response.status}`);
    }
}

export async function retry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === options.maxAttempts || !options.shouldRetry(error)) {
                break;
            }

            const baseDelay = options.baseDelay * Math.pow(2, attempt - 1);
            const jitter = Math.random() * (baseDelay * 0.2);
            const delay = baseDelay + jitter;

            options.onRetry?.(attempt, error, delay);

            await sleep(delay);
        }
    }

    console.log(`[Retry] Exhausted ${options.maxAttempts} attempts`);

    throw lastError;
}

export function isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    if (error instanceof RetryableHttpError) {
        switch (error.response.status) {
            case 502:
            case 503:
            case 504:
                return true;

            default:
                return false;
        }
    }

    if (error.name === 'AbortError') {
        return true;
    }

    if (!(error instanceof TypeError)) {
        return false;
    }

    const cause = (
        error as Error & {
            cause?: NodeJS.ErrnoException;
        }
    ).cause;

    if (!cause) {
        return true;
    }

    switch (cause.code) {
        case 'ECONNRESET':
        case 'ECONNREFUSED':
        case 'ETIMEDOUT':
        case 'EHOSTUNREACH':
        case 'ENETUNREACH':
        case 'EPIPE':
            return true;

        default:
            return false;
    }
}
