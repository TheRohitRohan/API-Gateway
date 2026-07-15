import { PaymentRepository } from '../repositories/payment.repository.js';
import { NotFoundError, BadRequestError } from '@microservices-demo/shared-utils';

export class PaymentService {
    constructor(private readonly paymentRepository: PaymentRepository) {}

    async processPayment(data: { orderId: string; amount: number; cardNumber: string }) {
        const transactionId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

        // Simulate payment failures for testing (cards ending in 4444 fail)
        const isFailure = data.cardNumber.endsWith('4444');
        const status = isFailure ? 'FAILED' : 'SUCCESS';

        return this.paymentRepository.create({
            orderId: data.orderId,
            amount: data.amount,
            status,
            transactionId,
        });
    }

    async getPaymentById(id: string) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new NotFoundError('Payment record not found');
        }
        return payment;
    }

    async refundPayment(id: string) {
        const payment = await this.paymentRepository.findById(id);
        if (!payment) {
            throw new NotFoundError('Payment record not found');
        }

        if (payment.status !== 'SUCCESS') {
            throw new BadRequestError(`Cannot refund payment in status ${payment.status}`);
        }

        return this.paymentRepository.updateStatus(id, 'REFUNDED');
    }
}
