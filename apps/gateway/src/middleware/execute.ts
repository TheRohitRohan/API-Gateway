import { FastifyReply, FastifyRequest } from 'fastify';
import { Middleware } from './types.js';

export async function executeMiddleware(
    request: FastifyRequest,
    reply: FastifyReply,
    middlewares: Middleware[],
) {
    let index = -1;

    async function dispatch(i: number): Promise<void> {
        if (i <= index) {
            throw new Error('next() called multiple times');
        }

        index = i;

        const middleware = middlewares[i];

        if (!middleware) {
            return;
        }

        await middleware(request, reply, () => dispatch(i + 1));
    }

    await dispatch(0);
}
