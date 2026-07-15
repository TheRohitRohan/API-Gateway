import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from '../services/product.service.js';
import { ApiResponse } from '@microservices-demo/shared-types';

export class ProductController {
    constructor(private readonly productService: ProductService) {}

    getProducts = async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
        const { page = 1, limit = 10, search, categoryId } = request.query as any;
        const result = await this.productService.getProducts({
            page: Number(page),
            limit: Number(limit),
            search: search ? String(search) : undefined,
            categoryId: categoryId ? String(categoryId) : undefined,
        });
        const response: ApiResponse = {
            success: true,
            message: 'Products retrieved successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    getProductById = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) => {
        const result = await this.productService.getProductById(request.params.id);
        const response: ApiResponse = {
            success: true,
            message: 'Product retrieved successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    createProduct = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
        const result = await this.productService.createProduct(request.body as any);
        const response: ApiResponse = {
            success: true,
            message: 'Product created successfully',
            data: result,
        };
        return reply.status(201).send(response);
    };

    updateProduct = async (
        request: FastifyRequest<{ Params: { id: string }; Body: any }>,
        reply: FastifyReply,
    ) => {
        const result = await this.productService.updateProduct(
            request.params.id,
            request.body as any,
        );
        const response: ApiResponse = {
            success: true,
            message: 'Product updated successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    deleteProduct = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) => {
        const result = await this.productService.deleteProduct(request.params.id);
        const response: ApiResponse = {
            success: true,
            message: 'Product deleted successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };

    getCategories = async (_request: FastifyRequest, reply: FastifyReply) => {
        const result = await this.productService.getCategories();
        const response: ApiResponse = {
            success: true,
            message: 'Categories retrieved successfully',
            data: result,
        };
        return reply.status(200).send(response);
    };
}
