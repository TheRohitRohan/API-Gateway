import { Middleware } from './types.js';
import { findService } from '../router/router.js';
import { GatewayRequest } from '../types/gateway.js';

export const routerMiddleware: Middleware = async (request, reply, next) => {
    const gatewayRequest = request as GatewayRequest;

    const service = findService(request.url);

    if (!service) {
        reply.status(404).send({
            error: 'Service not found',
        });
        return;
    }

    gatewayRequest.service = service;

    request.log.info(
        {
            requestId: gatewayRequest.requestId,
            service: service.name,
            prefix: service.prefix,
        },
        'Resolved upstream service',
    );

    await next();
};
