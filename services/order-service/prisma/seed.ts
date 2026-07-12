import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const customerUserId = 'customer-user-id-placeholder';

  // Clean
  const existing = await prisma.order.findMany({
    where: { userId: customerUserId },
  });

  for (const order of existing) {
    await prisma.order.delete({ where: { id: order.id } });
  }

  await prisma.order.create({
    data: {
      userId: customerUserId,
      status: 'PAID',
      totalAmount: 1389.97,
      items: {
        create: [
          {
            productId: 'elec-lap-001-uuid-placeholder',
            quantity: 1,
            price: 1299.99,
          },
          {
            productId: 'book-ref-001-uuid-placeholder',
            quantity: 2,
            price: 44.99,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: customerUserId,
      status: 'PENDING',
      totalAmount: 39.99,
      items: {
        create: [
          {
            productId: 'cloth-tsh-001-uuid-placeholder',
            quantity: 1,
            price: 39.99,
          },
        ],
      },
    },
  });

  console.log('Order service database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
