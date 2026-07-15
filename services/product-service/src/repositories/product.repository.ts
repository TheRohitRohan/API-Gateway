import { PrismaClient, Product, Category } from '../generated/client/index.js';

export class ProductRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findProducts(params: {
        page: number;
        limit: number;
        search?: string;
        categoryId?: string;
    }): Promise<{ items: Product[]; total: number }> {
        const { page, limit, search, categoryId } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { category: true },
            }),
            this.prisma.product.count({ where }),
        ]);

        return { items, total };
    }

    async findProductById(id: string): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    }

    async findProductBySku(sku: string): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { sku },
        });
    }

    async createProduct(data: {
        name: string;
        description: string;
        price: number;
        sku: string;
        stock: number;
        categoryId: string;
    }): Promise<Product> {
        return this.prisma.product.create({
            data,
        });
    }

    async updateProduct(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            price: number;
            sku: string;
            stock: number;
            categoryId: string;
        }>,
    ): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async deleteProduct(id: string): Promise<Product> {
        return this.prisma.product.delete({
            where: { id },
        });
    }

    async findCategories(): Promise<Category[]> {
        return this.prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findCategoryById(id: string): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }
}
