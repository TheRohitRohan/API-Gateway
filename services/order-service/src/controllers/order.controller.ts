import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../services/order.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (
    request: FastifyRequest<{ Body: any }>,
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

    const { items } = request.body as any;
    const result = await this.orderService.createOrder({
      userId,
      items,
    });
    const response: ApiResponse = {
      success: true,
      message: 'Order created successfully',
      data: result,
    };
    return reply.status(201).send(response);
  };

  getOrders = async (
    request: FastifyRequest<{ Querystring: any }>,
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

    const { page = 1, limit = 10 } = request.query as any;
    const result = await this.orderService.getUserOrders(userId, {
      page: Number(page),
      limit: Number(limit),
    });
    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: result,
    };
    return reply.status(200).send(response);
  };

  getOrderById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const userId = request.headers['x-user-id'] as string;
    const userRole = (request.headers['x-user-role'] as string) || 'customer';
    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Unauthorized: Missing user identity header',
        data: null,
      };
      return reply.status(401).send(response);
    }

    const result = await this.orderService.getOrderById(request.params.id, {
      id: userId,
      role: userRole,
    });
    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      data: result,
    };
    return reply.status(200).send(response);
  };

  cancelOrder = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const userId = request.headers['x-user-id'] as string;
    const userRole = (request.headers['x-user-role'] as string) || 'customer';
    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Unauthorized: Missing user identity header',
        data: null,
      };
      return reply.status(401).send(response);
    }

    const result = await this.orderService.cancelOrder(request.params.id, {
      id: userId,
      role: userRole,
    });
    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully',
      data: result,
    };
    return reply.status(200).send(response);
  };
}
