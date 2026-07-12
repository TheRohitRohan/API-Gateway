import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
    },
  });

  const books = await prisma.category.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      name: 'Books',
      slug: 'books',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
    },
  });

  await prisma.product.upsert({
    where: { sku: 'ELEC-LAP-001' },
    update: {},
    create: {
      name: 'Developer Laptop',
      description: 'High-performance laptop for developers.',
      price: 1299.99,
      sku: 'ELEC-LAP-001',
      stock: 50,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'ELEC-PHN-002' },
    update: {},
    create: {
      name: 'Smartphone Pro',
      description: 'The latest high-end smartphone.',
      price: 899.99,
      sku: 'ELEC-PHN-002',
      stock: 120,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'BOOK-REF-001' },
    update: {},
    create: {
      name: 'Designing Data-Intensive Applications',
      description: 'A great book for software architects.',
      price: 45.00,
      sku: 'BOOK-REF-001',
      stock: 200,
      categoryId: books.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'CLOTH-TSH-001' },
    update: {},
    create: {
      name: 'Developer Hoodie',
      description: 'Comfortable cotton hoodie with cool binary print.',
      price: 39.99,
      sku: 'CLOTH-TSH-001',
      stock: 75,
      categoryId: clothing.id,
    },
  });

  console.log('Product service database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
