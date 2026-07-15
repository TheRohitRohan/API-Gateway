import { CartRepository } from '../repositories/cart.repository.js';
import { Redis } from 'ioredis';
import { NotFoundError } from '@microservices-demo/shared-utils';

export class CartService {
    private readonly redisKeyPrefix = 'cart:';

    constructor(
        private readonly cartRepository: CartRepository,
        private readonly redisClient: Redis,
    ) {}

    private async getCache(userId: string): Promise<any | null> {
        try {
            const data = await this.redisClient.get(`${this.redisKeyPrefix}${userId}`);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            return null;
        }
    }

    private async setCache(userId: string, cart: any): Promise<void> {
        try {
            await this.redisClient.setex(
                `${this.redisKeyPrefix}${userId}`,
                3600, // 1 hour TTL
                JSON.stringify(cart),
            );
        } catch (err) {
            // Ignored - fallback to DB
        }
    }

    private async invalidateCache(userId: string): Promise<void> {
        try {
            await this.redisClient.del(`${this.redisKeyPrefix}${userId}`);
        } catch (err) {
            // Ignored
        }
    }

    async getCart(userId: string) {
        const cached = await this.getCache(userId);
        if (cached) {
            return cached;
        }

        let cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            cart = await this.cartRepository.create(userId);
        }

        await this.setCache(userId, cart);
        return cart;
    }

    async addItem(userId: string, productId: string, quantity: number) {
        let cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            cart = await this.cartRepository.create(userId);
        }

        await this.cartRepository.addItem(cart.id, productId, quantity);

        const updatedCart = await this.cartRepository.findByUserId(userId);
        await this.setCache(userId, updatedCart);
        return updatedCart;
    }

    async removeItem(userId: string, productId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        try {
            await this.cartRepository.removeItem(cart.id, productId);
        } catch (err) {
            throw new NotFoundError('Product not found in cart');
        }

        const updatedCart = await this.cartRepository.findByUserId(userId);
        await this.setCache(userId, updatedCart);
        return updatedCart;
    }

    async clearCart(userId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new NotFoundError('Cart not found');
        }

        await this.cartRepository.clear(cart.id);
        await this.invalidateCache(userId);

        const updatedCart = await this.cartRepository.findByUserId(userId);
        return updatedCart;
    }
}
