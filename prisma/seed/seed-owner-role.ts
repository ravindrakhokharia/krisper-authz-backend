import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const OAUTH_API_URL = process.env.OAUTH_API_URL || 'http://localhost:3000';

export async function seedOwnerRole(prisma: PrismaClient) {
  try {
    console.log('Starting Owner role seeding...');

    // 1. Fetch Owner user from OAuth backend
    const userResponse = await axios.get(`${OAUTH_API_URL}/users`, {
      params: { role: 'Owner' },
    });

    const users = userResponse.data.data;
    if (!users || users.length === 0) {
      console.log('No Owner user found in OAuth backend.');
      return;
    }

    const ownerUser = users[0];

    // 2. Create "Owner" role
    const role = await prisma.role.upsert({
      where: { name: 'Owner' },
      update: {},
      create: {
        name: 'Owner',
        description: 'Owner role with shop management access',
      },
    });

    // 3. Assign user to role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: ownerUser.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: ownerUser.id,
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

    console.log('Owner role and menu associations seeded successfully.');
  } catch (error: any) {
    console.error(
      'Error seeding Owner role:',
      error.response?.data || error.message,
    );
  }
}
