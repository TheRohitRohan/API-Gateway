import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const customerUserId = 'customer-user-id-placeholder';

  // Clean and create
  const existing = await prisma.cart.findUnique({
    where: { userId: customerUserId },
  });

  if (existing) {
    await prisma.cart.delete({ where: { id: existing.id } });
  }

  await prisma.cart.create({
    data: {
      userId: customerUserId,
      items: {
        create: [
          {
            productId: 'elec-lap-001-uuid-placeholder',
            quantity: 1,
          },
          {
            productId: 'book-ref-001-uuid-placeholder',
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('Cart service database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
