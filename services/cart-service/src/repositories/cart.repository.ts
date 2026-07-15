import { PrismaClient, Cart, CartItem } from '../generated/client/index.js';

export class CartRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByUserId(userId: string): Promise<(Cart & { items: CartItem[] }) | null> {
        return this.prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });
    }

    async create(userId: string): Promise<Cart & { items: CartItem[] }> {
        return this.prisma.cart.create({
            data: { userId },
            include: { items: true },
        });
    }

    async addItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
        return this.prisma.cartItem.upsert({
            where: {
                cartId_productId: { cartId, productId },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                cartId,
                productId,
                quantity,
            },
        });
    }

    async updateItemQuantity(
        cartId: string,
        productId: string,
        quantity: number,
    ): Promise<CartItem> {
        return this.prisma.cartItem.update({
            where: {
                cartId_productId: { cartId, productId },
            },
            data: { quantity },
        });
    }

    async removeItem(cartId: string, productId: string): Promise<CartItem> {
        return this.prisma.cartItem.delete({
            where: {
                cartId_productId: { cartId, productId },
            },
        });
    }

    async clear(cartId: string): Promise<void> {
        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
}
