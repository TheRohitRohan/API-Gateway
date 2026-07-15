import { v4 as uuid } from 'uuid';
import { Middleware } from './types.js';
import { GatewayRequest } from '../types/gateway.js';

export const requestIdMiddleware: Middleware = async (request, reply, next) => {
    const gatewayRequest = request as GatewayRequest;

    gatewayRequest.requestId = uuid();

    reply.header('X-Request-Id', gatewayRequest.requestId);

    await next();
};
