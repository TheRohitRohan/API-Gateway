import { FastifyInstance } from 'fastify';
import { CartController } from '../controllers/cart.controller.js';
import { z } from 'zod';

const addCartItemBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer').default(1),
});

export async function cartRoutes(fastify: FastifyInstance, controller: CartController) {
  fastify.get('/api/v1/cart', {
    schema: {
      description: 'Get or create the user\'s active cart',
      tags: ['Cart'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
        },
        required: ['x-user-id'],
      },
    },
    handler: controller.getCart,
  });

  fastify.post('/api/v1/cart/items', {
    schema: {
      description: 'Add an item to the cart or increment its quantity',
      tags: ['Cart'],
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
          productId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 },
        },
        required: ['productId', 'quantity'],
      },
    },
    preHandler: async (request) => {
      request.body = addCartItemBodySchema.parse(request.body);
    },
    handler: controller.addItem,
  });

  fastify.delete('/api/v1/cart/items/:productId', {
    schema: {
      description: 'Remove a specific item from the cart',
      tags: ['Cart'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
        },
        required: ['x-user-id'],
      },
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
    },
    handler: controller.removeItem,
  });

  fastify.delete('/api/v1/cart', {
    schema: {
      description: 'Clear all items from the cart',
      tags: ['Cart'],
      headers: {
        type: 'object',
        properties: {
          'x-user-id': { type: 'string' },
        },
        required: ['x-user-id'],
      },
    },
    handler: controller.clearCart,
  });
}
