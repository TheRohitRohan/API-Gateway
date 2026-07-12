import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import { AppError } from '@microservices-demo/shared-utils';
import { registerHealthRoutes } from './routes/health.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { NotificationController } from './controllers/notification.controller.js';
import { NotificationService } from './services/notification.service.js';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      redact: ['req.headers.authorization', 'password', 'token', 'access_token'],
    },
    disableRequestLogging: false,
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Validation Error',
        data: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    if (error instanceof AppError || ('isOperational' in error && error.isOperational)) {
      const err = error as AppError;
      return reply.status(err.statusCode).send({
        success: false,
        message: err.message,
        data: err.details,
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Internal Server Error',
      data: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Notification Service API',
        description: 'Microservices Playground - Notification Service REST API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3006',
          description: 'Local development',
        },
      ],
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  registerHealthRoutes(app, 'notification-service', '1.0.0');

  const notificationService = new NotificationService();
  const notificationController = new NotificationController(notificationService);

  app.register(async (instance) => {
    await notificationRoutes(instance, notificationController);
  });

  return app;
}
