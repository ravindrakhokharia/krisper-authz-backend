import { PrismaClient } from '@prisma/client';
import { seedActions } from './seed-actions';
import { seedMenus } from './seed-menu';
import { seedOwnerRole } from './seed-owner-role';
import { seedSuperAdminRole } from './seed-super-admin-role';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for AUTHZ Backend...\n');

  await seedActions(prisma);
  await seedMenus(prisma);
  await seedSuperAdminRole(prisma);
  await seedOwnerRole(prisma);

  console.log('\n✅ All seeds completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
