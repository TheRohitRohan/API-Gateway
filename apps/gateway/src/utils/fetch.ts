import { RetryableHttpError } from '../resilience/retry';

export async function executeRequest(url: string, options: RequestInit, timeout: number) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        if ([502, 503, 504].includes(response.status)) {
            throw new RetryableHttpError(response);
        }

        return response;
    } finally {
        clearTimeout(timer);
    }
}
