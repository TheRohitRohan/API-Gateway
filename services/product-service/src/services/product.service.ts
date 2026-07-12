import { ProductRepository } from '../repositories/product.repository.js';
import { ConflictError, NotFoundError } from '@microservices-demo/shared-utils';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
  }) {
    const { items, total } = await this.productRepository.findProducts(params);
    const totalPages = Math.ceil(total / params.limit);

    return {
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    sku: string;
    stock: number;
    categoryId: string;
  }) {
    const existingSku = await this.productRepository.findProductBySku(data.sku);
    if (existingSku) {
      throw new ConflictError(`Product with SKU ${data.sku} already exists`);
    }

    const category = await this.productRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return this.productRepository.createProduct(data);
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
  ) {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku) {
      const existingSku = await this.productRepository.findProductBySku(data.sku);
      if (existingSku && existingSku.id !== id) {
        throw new ConflictError(`Product with SKU ${data.sku} already exists`);
      }
    }

    if (data.categoryId) {
      const category = await this.productRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    return this.productRepository.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findProductById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return this.productRepository.deleteProduct(id);
  }

  async getCategories() {
    return this.productRepository.findCategories();
  }
}
