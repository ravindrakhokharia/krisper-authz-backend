import { PrismaClient } from '@prisma/client';

const actions = ['create', 'update', 'delete', 'view'];

export async function seedActions(prisma: PrismaClient) {
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
