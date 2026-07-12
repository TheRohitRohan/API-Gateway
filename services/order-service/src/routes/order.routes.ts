import { FastifyInstance } from 'fastify';
import { OrderController } from '../controllers/order.controller.js';
import { z } from 'zod';

const createOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        price: z.number().nonnegative('Price cannot be negative'),
      }),
    )
    .min(1, 'Order must contain at least one item'),
});

const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export async function orderRoutes(fastify: FastifyInstance, controller: OrderController) {
  fastify.post('/api/v1/orders', {
    schema: {
      description: 'Create a new order',
      tags: ['Orders'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
        },
        required: ['x-user-id'],
      },
      body: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
              required: ['productId', 'quantity', 'price'],
            },
          },
        },
        required: ['items'],
      },
    },
    preHandler: async (request) => {
      request.body = createOrderBodySchema.parse(request.body);
    },
    handler: controller.createOrder,
  });

  fastify.get('/api/v1/orders', {
    schema: {
      description: 'Get paginated order history for the logged in user',
      tags: ['Orders'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
        },
        required: ['x-user-id'],
      },
    },
    preHandler: async (request) => {
      request.query = queryParamsSchema.parse(request.query);
    },
    handler: controller.getOrders,
  });

  fastify.get('/api/v1/orders/:id', {
    schema: {
      description: 'Get details of a specific order',
      tags: ['Orders'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
          'x-user-role': { type: 'string' },
        },
        required: ['x-user-id'],
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: controller.getOrderById,
  });

  fastify.post('/api/v1/orders/:id/cancel', {
    schema: {
      description: 'Cancel a pending order',
      tags: ['Orders'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
          'x-user-role': { type: 'string' },
        },
        required: ['x-user-id'],
      },
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: controller.cancelOrder,
  });
}
