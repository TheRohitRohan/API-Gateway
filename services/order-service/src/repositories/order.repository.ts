import { PrismaClient, Order, OrderItem } from '../generated/client/index.js';

export class OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    userId: string;
    totalAmount: number;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }): Promise<Order & { items: OrderItem[] }> {
    return this.prisma.order.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        status: 'PENDING',
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    params: { page: number; limit: number },
  ): Promise<{ items: Array<Order & { items: OrderItem[] }>; total: number }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
