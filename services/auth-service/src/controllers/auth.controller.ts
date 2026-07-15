import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    register = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
        const result = await this.authService.register(request.body as any);
        const response: ApiResponse = {
            success: true,
            message: 'User registered successfully',
            data: result,
        };
        return reply.status(201).send(response);
    };

    login = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
        const result = await this.authService.login(request.body as any);
        const response: ApiResponse = {
            success: true,
            message: 'Login successful',
            data: result,
        };
        return reply.status(200).send(response);
    };

    me = async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = request.headers['x-user-id'] as string;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized: Missing user identity header',
                data: null,
            };
            return reply.status(401).send(response);
        }
        const result = await this.authService.getUserProfile(userId);
        const response: ApiResponse = {
            success: true,
            message: 'Profile retrieved successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    roles = async (_request: FastifyRequest, reply: FastifyReply) => {
        const response: ApiResponse = {
            success: true,
            message: 'Roles retrieved successfully',
            data: {
                roles: ['admin', 'customer'],
            },
        };
        return reply.status(200).send(response);
    };
}
