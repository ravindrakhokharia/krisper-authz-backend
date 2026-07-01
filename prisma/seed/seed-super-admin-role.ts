import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const OAUTH_API_URL = process.env.OAUTH_API_URL || 'http://localhost:3000';

export async function seedSuperAdminRole(prisma: PrismaClient) {
  try {
    console.log('Starting Super Admin role seeding...');

    // 1. Fetch Super Admin user from OAuth backend
    const userResponse = await axios.get(`${OAUTH_API_URL}/users`, {
      params: { role: 'Super Admin' },
    });

    const users = userResponse.data.data;
    if (!users || users.length === 0) {
      console.warn(
        'No Super Admin user found in OAuth backend. Please seed Super Admin user first.',
      );
      return;
    }

    const superAdminUser = users[0];

    // 2. Create "Super Admin" role
    const role = await prisma.role.upsert({
      where: { name: 'Super Admin' },
      update: {
        createdBy: 'SYSTEM',
      },
      create: {
        name: 'Super Admin',
        description: 'Full access to all system resources',
        createdBy: 'SYSTEM',
      },
    });

    // 3. Assign user to role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdminUser.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: role.id,
      },
    });

    // 4. Assign all menus to role
    const allMenus = await prisma.menu.findMany();

    for (const menu of allMenus) {
      await prisma.roleMenu.upsert({
        where: {
          roleId_menuId: {
            roleId: role.id,
            menuId: menu.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          menuId: menu.id,
        },
      });
    }

    console.log('Super Admin role and menu associations seeded successfully.');
  } catch (error: any) {
    console.error(
      'Error seeding Super Admin role:',
      error.response?.data || error.message,
    );
  }
}
