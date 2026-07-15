import { FastifyReply, FastifyRequest } from 'fastify';
import { promises } from 'node:dns';

export type NextFunction = () => Promise<void>;

export type Middleware = (
    request: FastifyRequest,
    reply: FastifyReply,
    next: NextFunction,
) => Promise<void> | void;
