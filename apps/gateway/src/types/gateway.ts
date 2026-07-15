import { FastifyRequest } from 'fastify';
import { ServiceConfig } from '../config/services.js';
import { AuthUser } from '../auth/types.js';

export interface GatewayRequest extends FastifyRequest {
    service?: ServiceConfig;
    requestId: string;
    user?: AuthUser;
}
