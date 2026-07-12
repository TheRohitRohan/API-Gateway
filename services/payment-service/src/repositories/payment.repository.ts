import { PrismaClient, Payment } from '../generated/client/index.js';

export class PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    orderId: string;
    amount: number;
    status: string;
    transactionId: string;
  }): Promise<Payment> {
    return this.prisma.payment.create({
      data,
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { transactionId },
    });
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data: { status },
    });
  }
}
