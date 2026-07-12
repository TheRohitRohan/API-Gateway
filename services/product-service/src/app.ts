import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import { AppError } from '@microservices-demo/shared-utils';
import { registerHealthRoutes } from './routes/health.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { ProductController } from './controllers/product.controller.js';
import { ProductService } from './services/product.service.js';
import { ProductRepository } from './repositories/product.repository.js';
import { PrismaClient } from './generated/client/index.js';

export function buildApp(prisma: PrismaClient): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      redact: ['req.headers.authorization', 'password', 'token', 'access_token'],
    },
    disableRequestLogging: false,
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Product Service API',
        description: 'Microservices Playground - Product Service REST API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3002',
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

  registerHealthRoutes(app, 'product-service', '1.0.0');

  const productRepository = new ProductRepository(prisma);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  app.register(async (instance) => {
    await productRoutes(instance, productController);
  });

  return app;
}
