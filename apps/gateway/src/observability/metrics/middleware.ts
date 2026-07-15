import { Middleware } from '../../middleware/types.js';
import {
    decrementActiveRequests,
    incrementActiveRequests,
    recordHttpRequest,
    startHttpRequestTimer,
} from './http.js';

export const metricsMiddleware: Middleware = async (request, reply, next) => {
    incrementActiveRequests();

    const stopTimer = startHttpRequestTimer(request.method, request.url);

    try {
        await next();
    } finally {
        stopTimer({
            status: String(reply.statusCode),
        });

        recordHttpRequest(request.method, request.url, reply.statusCode);

        decrementActiveRequests();
    }
};
