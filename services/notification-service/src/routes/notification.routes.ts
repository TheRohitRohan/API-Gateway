import { FastifyInstance } from 'fastify';
import { NotificationController } from '../controllers/notification.controller.js';
import { z } from 'zod';

const emailBodySchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

const smsBodySchema = z.object({
  to: z.string().min(10, 'Invalid phone number format'),
  message: z.string().min(1, 'Message is required'),
});

const pushBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
});

export async function notificationRoutes(fastify: FastifyInstance, controller: NotificationController) {
  fastify.post('/api/v1/notifications/email', {
    schema: {
      description: 'Send email notification (mock)',
      tags: ['Notifications'],
      body: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
    preHandler: async (request) => {
      request.body = emailBodySchema.parse(request.body);
    },
    handler: controller.sendEmail,
  });

  fastify.post('/api/v1/notifications/sms', {
    schema: {
      description: 'Send SMS notification (mock)',
      tags: ['Notifications'],
      body: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['to', 'message'],
      },
    },
    preHandler: async (request) => {
      request.body = smsBodySchema.parse(request.body);
    },
    handler: controller.sendSms,
  });

  fastify.post('/api/v1/notifications/push', {
    schema: {
      description: 'Send push notification (mock)',
      tags: ['Notifications'],
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['userId', 'title', 'body'],
      },
    },
    preHandler: async (request) => {
      request.body = pushBodySchema.parse(request.body);
    },
    handler: controller.sendPush,
  });
}
