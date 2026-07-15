import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/product.controller.js';
import { z } from 'zod';

const createProductBodySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().default(''),
    price: z.number().positive('Price must be positive'),
    sku: z.string().min(1, 'SKU is required'),
    stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
    categoryId: z.string().uuid('Invalid category ID format'),
});

const updateProductBodySchema = createProductBodySchema.partial();

const queryParamsSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
});

export async function productRoutes(fastify: FastifyInstance, controller: ProductController) {
    fastify.get('/api/v1/products', {
        schema: {
            description: 'Get paginated products list with searching and filtering',
            tags: ['Products'],
        },
        preHandler: async (request) => {
            request.query = queryParamsSchema.parse(request.query);
        },
        handler: controller.getProducts,
    });

    fastify.get('/api/v1/products/:id', {
        schema: {
            description: 'Get details of a specific product',
            tags: ['Products'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
        },
        handler: controller.getProductById,
    });

    fastify.post('/api/v1/products', {
        schema: {
            description: 'Create a new product',
            tags: ['Products'],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    sku: { type: 'string' },
                    stock: { type: 'integer' },
                    categoryId: { type: 'string' },
                },
                required: ['name', 'price', 'sku', 'categoryId'],
            },
        },
        preHandler: async (request) => {
            request.body = createProductBodySchema.parse(request.body);
        },
        handler: controller.createProduct,
    });

    fastify.put('/api/v1/products/:id', {
        schema: {
            description: 'Update an existing product',
            tags: ['Products'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
        },
        preHandler: async (request) => {
            request.body = updateProductBodySchema.parse(request.body);
        },
        handler: controller.updateProduct,
    });

    fastify.delete('/api/v1/products/:id', {
        schema: {
            description: 'Delete a product',
            tags: ['Products'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
        },
        handler: controller.deleteProduct,
    });

    fastify.get('/api/v1/categories', {
        schema: {
            description: 'Get all categories list',
            tags: ['Categories'],
        },
        handler: controller.getCategories,
    });
}
