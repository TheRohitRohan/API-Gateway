import { Middleware } from './types.js';
import { GatewayRequest } from '../types/gateway.js';
import { proxyRequest } from '../proxy/proxy.js';

export const proxyMiddleware: Middleware = async (request, reply, next) => {
    const gatewayRequest = request as GatewayRequest;

    await proxyRequest(request, reply, gatewayRequest.service!);
};
