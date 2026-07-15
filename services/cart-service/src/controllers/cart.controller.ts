import { FastifyRequest, FastifyReply } from 'fastify';
import { CartService } from '../services/cart.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class CartController {
    constructor(private readonly cartService: CartService) {}

    getCart = async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = request.headers['x-user-id'] as string;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized: Missing user identity header',
                data: null,
            };
            return reply.status(401).send(response);
        }

        const result = await this.cartService.getCart(userId);
        const response: ApiResponse = {
            success: true,
            message: 'Cart retrieved successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    addItem = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
        const userId = request.headers['x-user-id'] as string;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized: Missing user identity header',
                data: null,
            };
            return reply.status(401).send(response);
        }

        const { productId, quantity } = request.body as any;
        const result = await this.cartService.addItem(userId, productId, Number(quantity));
        const response: ApiResponse = {
            success: true,
            message: 'Item added to cart successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    removeItem = async (
        request: FastifyRequest<{ Params: { productId: string } }>,
        reply: FastifyReply,
    ) => {
        const userId = request.headers['x-user-id'] as string;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized: Missing user identity header',
                data: null,
            };
            return reply.status(401).send(response);
        }

        const result = await this.cartService.removeItem(userId, request.params.productId);
        const response: ApiResponse = {
            success: true,
            message: 'Item removed from cart successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    clearCart = async (request: FastifyRequest, reply: FastifyReply) => {
        const userId = request.headers['x-user-id'] as string;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                message: 'Unauthorized: Missing user identity header',
                data: null,
            };
            return reply.status(401).send(response);
        }

        const result = await this.cartService.clearCart(userId);
        const response: ApiResponse = {
            success: true,
            message: 'Cart cleared successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };
}
