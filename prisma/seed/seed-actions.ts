import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const actions = ['create', 'update', 'delete', 'view'];

export async function seedActions() {
  try {
    actions?.map(async (name, index) => {
      await prisma.action.upsert({
        where: { id: index + 1 },
        update: {
          name: name,
          id: index + 1,
        },
        create: {
          name: name,
          id: index + 1,
        },
      });
    });

    console.log('Actions seeded successfully.');
  } catch (error) {
    console.error('Error seeding actions:', error);
  }
}

seedActions()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
