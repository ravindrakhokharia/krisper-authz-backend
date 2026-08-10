import { PrismaClient } from '@prisma/client';

export async function seedAdminRole(prisma: PrismaClient) {
  try {
    console.log('Starting Admin role seeding...');

    // 1. Create "Admin" role
    await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {
        createdBy: 'SYSTEM',
      },
      create: {
        name: 'Admin',
        description: 'Admin role with administrative management access',
        createdBy: 'SYSTEM',
      },
    });

    console.log('Admin role seeded successfully.');
  } catch (error: any) {
    console.error(
      'Error seeding Admin role:',
      error.message || error,
    );
  }
}
