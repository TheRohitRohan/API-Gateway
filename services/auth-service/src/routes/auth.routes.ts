import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { z } from 'zod';

const registerBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['admin', 'customer']).optional(),
});

const loginBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

export async function authRoutes(fastify: FastifyInstance, controller: AuthController) {
    fastify.post('/api/v1/auth/register', {
        schema: {
            description: 'Register a new user',
            tags: ['Auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'customer'] },
                },
                required: ['email', 'password', 'name'],
            },
        },
        preHandler: async (request) => {
            request.body = registerBodySchema.parse(request.body);
        },
        handler: controller.register,
    });

    fastify.post('/api/v1/auth/login', {
        schema: {
            description: 'Login and retrieve JWT token',
            tags: ['Auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                },
                required: ['email', 'password'],
            },
        },
        preHandler: async (request) => {
            request.body = loginBodySchema.parse(request.body);
        },
        handler: controller.login,
    });

    fastify.get('/api/v1/auth/me', {
        schema: {
            description: 'Get details of the currently logged in user',
            tags: ['Auth'],
            headers: {
                type: 'object',
                properties: {
                    'x-user-id': { type: 'string' },
                },
                required: ['x-user-id'],
            },
        },
        handler: controller.me,
    });

    fastify.get('/api/v1/auth/roles', {
        schema: {
            description: 'Get list of supported roles',
            tags: ['Auth'],
        },
        handler: controller.roles,
    });

    fastify.get('/api/v1/auth/slow', async () => {
        await new Promise((r) => setTimeout(r, 5000));

        return {
            ok: true,
        };
    });

    let attempts = 0;

    fastify.get('/api/v1/auth/flaky', async (_request, reply) => {
        attempts++;

        console.log(`Attempt ${attempts}`);

        if (attempts < 3) {
            return reply.status(503).send({
                error: 'Temporary failure',
            });
        }

        attempts = 0;

        return {
            success: true,
        };
    });
}
