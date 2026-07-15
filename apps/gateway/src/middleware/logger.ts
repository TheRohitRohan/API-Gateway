import { Middleware } from './types.js';
import { GatewayRequest } from '../types/gateway.js';
import { isShuttingDown } from '../lifecycle/state.js';

export const logger: Middleware = async (request, reply, next) => {
    const start = performance.now();
    const gatewayRequest = request as GatewayRequest;

    if (isShuttingDown()) {
        return reply.status(503).send({
            error: 'Service Unavailable',
            message: 'Gateway is shutting down.',
        });
    }

    console.log(`[${gatewayRequest.requestId}] -> ${request.method} ${request.url}`);

    await next();

    const duration = performance.now() - start;

    console.log(`[${gatewayRequest.requestId}] <- ${reply.statusCode} ${duration.toFixed(2)}ms`);
};
