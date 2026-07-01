import { PrismaClient } from '@prisma/client';

export async function seedOwnerRole(prisma: PrismaClient) {
  try {
    console.log('Starting Owner role seeding...');

    // 1. Create "Owner" role
    const role = await prisma.role.upsert({
      where: { name: 'Owner' },
      update: {
        createdBy: 'SYSTEM',
      },
      create: {
        name: 'Owner',
        description: 'Owner role with shop management access',
        createdBy: 'SYSTEM',
      },
    });

    console.log('Owner role seeded successfully.');
  } catch (error: any) {
    console.error(
      'Error seeding Owner role:',
      error.message || error,
    );
  }
}
