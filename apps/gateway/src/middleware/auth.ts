import { jwtConfig } from '../config/jwt.js';
import jwt from 'jsonwebtoken';
import { Middleware } from './types.js';
import { GatewayRequest } from '../types/gateway.js';
import { AccessTokenPayload } from '../auth/types.js';

const PUBLIC_ROUTES = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/health',
    '/version',
    '/metrics',
    '/documentation',
] as const;

export const authMiddleware: Middleware = async (request, reply, next) => {
    const authorization = request.headers.authorization;

    if (PUBLIC_ROUTES.some((route) => request.url.startsWith(route))) {
        await next();
        return;
    }

    if (!authorization) {
        reply.status(401).send({
            error: 'Missing Authorization header',
        });

        return;
    }

    if (!authorization.startsWith('Bearer ')) {
        reply.status(401).send({
            error: 'Invalid Authorization header',
        });

        return;
    }

    const token = authorization.substring(7);

    try {
        const payload = jwt.verify(token, jwtConfig.secret) as AccessTokenPayload;

        const gatewayRequest = request as GatewayRequest;

        gatewayRequest.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };

        await next();
    } catch (err) {
        reply.status(401).send({
            error: 'Invalid or expired token',
        });
    }
};
