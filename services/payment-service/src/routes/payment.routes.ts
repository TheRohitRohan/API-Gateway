import { FastifyInstance } from 'fastify';
import { PaymentController } from '../controllers/payment.controller.js';
import { z } from 'zod';

const processPaymentBodySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Amount must be positive'),
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(16),
});

export async function paymentRoutes(fastify: FastifyInstance, controller: PaymentController) {
  fastify.post('/api/v1/payments', {
    schema: {
      description: 'Process a mock payment transaction',
      tags: ['Payments'],
      body: {
        type: 'object',
        properties: {
          orderId: { type: 'string' },
          amount: { type: 'number' },
          cardNumber: { type: 'string', minLength: 16, maxLength: 16 },
        },
        required: ['orderId', 'amount', 'cardNumber'],
      },
    },
    preHandler: async (request) => {
      request.body = processPaymentBodySchema.parse(request.body);
    },
    handler: controller.processPayment,
  });

  fastify.get('/api/v1/payments/:id', {
    schema: {
      description: 'Get details of a specific payment transaction',
      tags: ['Payments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: controller.getPaymentById,
  });

  fastify.post('/api/v1/payments/:id/refund', {
    schema: {
      description: 'Process a refund for a successful payment',
      tags: ['Payments'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    handler: controller.refundPayment,
  });
}
