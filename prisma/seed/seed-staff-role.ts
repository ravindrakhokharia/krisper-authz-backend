import { PrismaClient } from '@prisma/client';

export async function seedStaffRole(prisma: PrismaClient) {
  try {
    console.log('Starting Staff role seeding...');

    // 1. Create "Staff" role
    const role = await prisma.role.upsert({
      where: { name: 'Staff' },
      update: {
        createdBy: 'SYSTEM',
      },
      create: {
        name: 'Staff',
        description: 'Staff role with restricted shop access',
        createdBy: 'SYSTEM',
      },
    });

    console.log('Staff role seeded successfully.');
  } catch (error: any) {
    console.error(
      'Error seeding Staff role:',
      error.message || error,
    );
  }
}
