import { PrismaClient } from '../src/generated/client/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const customerPasswordHash = await bcrypt.hash('customer123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            password: adminPasswordHash,
            name: 'Demo Admin',
            role: 'admin',
        },
    });

    await prisma.user.upsert({
        where: { email: 'customer@demo.com' },
        update: {},
        create: {
            email: 'customer@demo.com',
            password: customerPasswordHash,
            name: 'Demo Customer',
            role: 'customer',
        },
    });

    console.log('Auth service database seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
