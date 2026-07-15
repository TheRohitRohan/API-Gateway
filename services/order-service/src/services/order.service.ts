import { OrderRepository } from '../repositories/order.repository.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '@microservices-demo/shared-utils';

export class OrderService {
    constructor(private readonly orderRepository: OrderRepository) {}

    async createOrder(data: {
        userId: string;
        items: Array<{ productId: string; quantity: number; price: number }>;
    }) {
        if (!data.items || data.items.length === 0) {
            throw new BadRequestError('Cannot create an order with no items');
        }

        const totalAmount = data.items.reduce((sum, item) => {
            if (item.quantity <= 0 || item.price < 0) {
                throw new BadRequestError('Invalid item quantity or price');
            }
            return sum + item.quantity * item.price;
        }, 0);

        return this.orderRepository.create({
            userId: data.userId,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            items: data.items,
        });
    }

    async getUserOrders(userId: string, params: { page: number; limit: number }) {
        const { items, total } = await this.orderRepository.findByUserId(userId, params);
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

    async getOrderById(id: string, currentUser: { id: string; role: string }) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
            throw new ForbiddenError('You do not have permission to access this order');
        }

        return order;
    }

    async cancelOrder(id: string, currentUser: { id: string; role: string }) {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (order.userId !== currentUser.id && currentUser.role !== 'admin') {
            throw new ForbiddenError('You do not have permission to cancel this order');
        }

        if (order.status !== 'PENDING') {
            throw new BadRequestError(`Cannot cancel order in status ${order.status}`);
        }

        return this.orderRepository.updateStatus(id, 'CANCELLED');
    }
}
