import { Middleware } from './types.js';
import { GatewayRequest } from '../types/gateway.js';

export const authorizeMiddleware: Middleware = async (request, reply, next) => {
    const gatewayRequest = request as GatewayRequest;
    const service = gatewayRequest.service;

    if (!service) {
        reply.status(500).send({
            error: 'Service Not Resolved',
        });
        return;
    }

    if (!service.roles || service.roles.length === 0) {
        await next();
        return;
    }

    if (!gatewayRequest.user) {
        reply.status(401).send({
            error: 'Unauthenticated',
        });

        return;
    }

    if (!service.roles?.includes(gatewayRequest.user.role)) {
        reply.status(403).send({
            error: 'Forbidden',
        });

        return;
    }

    await next();
};
