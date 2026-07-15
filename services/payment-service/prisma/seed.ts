import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    const orderIdPlaceholder = 'order-id-placeholder-1';

    await prisma.payment.upsert({
        where: { transactionId: 'TXN-123456789' },
        update: {},
        create: {
            orderId: orderIdPlaceholder,
            amount: 1389.97,
            status: 'SUCCESS',
            transactionId: 'TXN-123456789',
        },
    });

    await prisma.payment.upsert({
        where: { transactionId: 'TXN-987654321' },
        update: {},
        create: {
            orderId: 'order-id-placeholder-2',
            amount: 39.99,
            status: 'PENDING',
            transactionId: 'TXN-987654321',
        },
    });

    console.log('Payment service database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
