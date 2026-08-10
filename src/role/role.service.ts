import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { OAUTH_API_URL } from 'src/shared/constants/constant';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(createRoleDto: CreateRoleDto, loginUser?: any) {
    const userIds = [...new Set(createRoleDto.userIds || [])];
    const menuIds = [...new Set(createRoleDto.menuIds || [])];
    const loginUserId =
      typeof loginUser === 'string' ? loginUser : loginUser?.id;

    // if (userIds.length === 0 || menuIds.length === 0) {
    //   throw new BadRequestException(
    //     'At least one user and permission must be assigned to create a role',
    //   );
    // }
    if (createRoleDto.name.trim().toLowerCase() === 'super admin') {
      throw new BadRequestException(
        'You cannot create a role with the name "Super Admin"',
      );
    }

    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      return {
        data: existingRole,
        message: 'Role already exists',
      };
    }

    const oauthApiUrl = OAUTH_API_URL || process.env.OAUTH_API_URL;
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const { data } = await firstValueFrom(
          this.httpService.get(`${oauthApiUrl}/users/${userId}`),
        );

        if (!data) {
          throw new BadRequestException(`Invalid user: ${userId}`);
        }

        return data;
      }),
    );

    // Enforce role assignment rules
    if (createRoleDto.name === 'Super Admin') {
      const isLoginUserSuperAdmin = loginUser?.roles?.includes('Super Admin');
      if (!isLoginUserSuperAdmin) {
        throw new ForbiddenException(
          'Only Super Admins can assign the Super Admin role.',
        );
      }

      for (const u of users) {
        const roles: string[] = u.data?.roles || [];
        if (roles.length > 0 && !roles.includes('Super Admin')) {
          throw new BadRequestException(
            'Cannot assign Super Admin to a user with other roles.',
          );
        }
      }
    } else {
      for (const u of users) {
        const roles: string[] = u.data?.roles || [];
        if (roles.includes('Super Admin')) {
          throw new BadRequestException(
            `Cannot assign role ${createRoleDto.name} to a Super Admin user.`,
          );
        }
      }
    }

    const role = await this.prisma.$transaction(async (tx) => {
      return await tx.role.create({
        data: {
          name: createRoleDto.name,
          description: createRoleDto.description,
          isActive: createRoleDto.isActive,
          createdBy: loginUserId,
          roleMenus: {
            createMany: {
              data: menuIds.map((menuId) => ({
                menuId,
                createdBy: loginUserId,
              })),
              skipDuplicates: true,
            },
          },
          userRoles: {
            createMany: {
              data: userIds.map((userId) => ({
                userId,
                createdBy: loginUserId,
              })),
              skipDuplicates: true,
            },
          },
        },
      });
    });

    await Promise.all(
      users.map((user) =>
        this.addRoleToOAuthUser(user.data.id, createRoleDto.name),
      ),
    );

    return {
      data: {
        ...role,
        isDeletable: role.createdBy !== 'SYSTEM',
        isEditable: role.createdBy !== 'SYSTEM',
      },
      message: 'Role created successfully',
    };
  }

  async findAll(loginUser?: any) {
    const isSuperAdmin = loginUser?.roles?.includes('Super Admin');
    const isAdmin = loginUser?.roles?.includes('Admin');

    let whereClause: any;

    if (isSuperAdmin || !loginUser) {
      whereClause = {};
    } else if (isAdmin) {
      whereClause = {
        AND: [
          { name: { not: 'Super Admin' } },
          {
            OR: [
              { name: { in: ['Owner', 'Staff', 'Admin'] } },
              { createdBy: loginUser?.id },
              {
                userRoles: {
                  some: {
                    userId: loginUser?.id,
                  },
                },
              },
            ],
          },
        ],
      };
    } else {
      whereClause = {
        OR: [
          { createdBy: loginUser?.id },
          {
            userRoles: {
              some: {
                userId: loginUser?.id,
              },
            },
          },
        ],
      };
    }

    const roles = await this.prisma.role.findMany({
      where: whereClause,
      include: {
        roleMenus: {
          include: {
            menu: true,
          },
        },
        userRoles: true,
      },
    });

    const rolesWithAssigned = (roles || []).map((role) => ({
      ...role,
      isDeletable: role.createdBy !== 'SYSTEM',
      isEditable: role.createdBy !== 'SYSTEM',
      isAssigned:
        role.userRoles?.some((ur) => ur.userId === loginUser?.id) || false,
    }));

    return { data: rolesWithAssigned, message: 'Roles fetched successfully' };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        roleMenus: {
          include: {
            menu: true,
          },
        },
        userRoles: true,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const roleWithDeletable = {
      ...role,
      isDeletable: role.createdBy !== 'SYSTEM',
      isEditable: role.createdBy !== 'SYSTEM',
    };

    return { data: roleWithDeletable, message: 'Role fetched successfully' };
  }

  async findOneByName(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        roleMenus: {
          include: {
            menu: true,
          },
        },
        userRoles: true,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const roleWithDeletable = {
      ...role,
      isDeletable: role.createdBy !== 'SYSTEM',
      isEditable: role.createdBy !== 'SYSTEM',
    };

    return { data: roleWithDeletable, message: 'Role fetched successfully' };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, loginUser?: any) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
        roleMenus: true,
      },
    });

    if (!existingRole) {
      throw new BadRequestException('Role not found');
    }

    if (existingRole.createdBy === 'SYSTEM') {
      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        throw new BadRequestException(
          'Role name cannot be modified for System roles',
        );
      }
    }

    const { name } = updateRoleDto;
    if (name) {
      const existingRoleWithSameName = await this.prisma.role.findUnique({
        where: { name },
      });

      if (existingRoleWithSameName && existingRoleWithSameName.id !== id) {
        throw new BadRequestException('Role name already exists');
      }
    }

    const existingMenuIds = existingRole.roleMenus.map((m) => m.menuId);
    const existingUserIds = existingRole.userRoles.map((u) => u.userId);

    const menuIds = updateRoleDto.menuIds ?? existingMenuIds;
    const userIds = updateRoleDto.userIds ?? existingUserIds;

    const menuSet = new Set(menuIds);
    const existingMenuSet = new Set(existingMenuIds);

    const userSet = new Set(userIds);
    const existingUserSet = new Set(existingUserIds);

    const menusToAdd = menuIds?.filter((id) => !existingMenuSet.has(id)) || [];
    const menusToRemove =
      existingMenuIds?.filter((id) => !menuSet.has(id)) || [];

    const usersToAdd = userIds?.filter((id) => !existingUserSet.has(id)) || [];
    const usersToRemove =
      existingUserIds?.filter((id) => !userSet.has(id)) || [];

    const oldName = existingRole.name || '';
    const newName = updateRoleDto.name || oldName;
    const isRenamed = newName !== oldName;
    const isSuperAdminRole = newName.toLowerCase() === 'super admin';
    const isOwnerRole = newName.toLowerCase() === 'owner';

    // Validate role compatibility for added users (or all users if the role itself is renamed)
    const usersToValidate = isRenamed ? userIds : usersToAdd;
    const oauthApiUrl = OAUTH_API_URL || process.env.OAUTH_API_URL;

    const usersDetails = await Promise.all(
      usersToValidate.map(async (userId) => {
        const { data } = await firstValueFrom(
          this.httpService.get(`${oauthApiUrl}/users/${userId}`),
        );
        if (!data) {
          throw new BadRequestException(`Invalid user ID: ${userId}`);
        }
        return {
          userId,
          rolesLower: (data?.data?.roles || []).map((r: string) =>
            r.toLowerCase(),
          ),
        };
      }),
    );

    // Enforce role compatibility rules
    if (isSuperAdminRole) {
      const isLoginUserSuperAdmin = loginUser?.roles?.some(
        (r: string) => r.toLowerCase() === 'super admin',
      );
      if (!isLoginUserSuperAdmin) {
        throw new ForbiddenException(
          'Only Super Admins can assign the Super Admin role.',
        );
      }

      for (const u of usersDetails) {
        const hasIncompatibleRole = u.rolesLower.some(
          (r) => r !== 'owner' && r !== 'super admin',
        );
        if (hasIncompatibleRole) {
          throw new BadRequestException(
            'Cannot assign Super Admin to a user with other roles.',
          );
        }
      }
    } else if (!isOwnerRole) {
      for (const u of usersDetails) {
        if (u.rolesLower.includes('super admin')) {
          throw new BadRequestException(
            `Cannot assign ${newName} role to Super Admin user.`,
          );
        }
      }
    }

    const { menuIds: _, userIds: __, ...roleData } = updateRoleDto;

    const role = await this.prisma.$transaction(async (tx) => {
      const updatedRole = await tx.role.update({
        where: { id },
        data: roleData,
      });

      if (menusToRemove.length) {
        await tx.roleMenu.deleteMany({
          where: { roleId: id, menuId: { in: menusToRemove } },
        });
      }

      if (menusToAdd.length) {
        await tx.roleMenu.createMany({
          data: menusToAdd.map((menuId) => ({
            roleId: id,
            menuId,
          })),
          skipDuplicates: true,
        });
      }

      if (usersToRemove.length) {
        await tx.userRole.deleteMany({
          where: { roleId: id, userId: { in: usersToRemove } },
        });
      }

      if (usersToAdd.length) {
        await tx.userRole.createMany({
          data: usersToAdd.map((userId) => ({
            roleId: id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      return updatedRole;
    });

    await Promise.all(
      usersToRemove.map(async (userId) => {
        await this.removeRoleFromOAuthUser(userId, oldName);
        if (isRenamed) {
          await this.removeRoleFromOAuthUser(userId, newName);
        }
      }),
    );

    await Promise.all(
      userIds.map(async (userId) => {
        if (isRenamed) {
          await this.removeRoleFromOAuthUser(userId, oldName);
        }
        await this.addRoleToOAuthUser(userId, newName);
      }),
    );

    return {
      data: {
        ...role,
        isDeletable: role.createdBy !== 'SYSTEM',
        isEditable: role.createdBy !== 'SYSTEM',
      },
      message: 'Role updated successfully',
    };
  }

  private async removeRoleFromOAuthUser(userId: string, roleName: string) {
    try {
      const oauthApiUrl = OAUTH_API_URL || process.env.OAUTH_API_URL;

      let { data: user } = await firstValueFrom(
        this.httpService.get(`${oauthApiUrl}/users/${userId}`),
      );

      user = user.data;
      const userRoles = user?.roles || [];

      const updatedRoles = userRoles.filter(
        (role: string) => role !== roleName,
      );

      await firstValueFrom(
        this.httpService.put(`${oauthApiUrl}/users/${userId}`, {
          roles: updatedRoles,
        }),
      );
    } catch (error) {
      console.log('Failed to remove role from user', error);

      throw new BadRequestException({
        message: 'Failed to remove role from user',
        error: error.response?.data?.message,
      });
    }
  }

  private async addRoleToOAuthUser(userId: string, roleName: string) {
    try {
      const oauthApiUrl = OAUTH_API_URL || process.env.OAUTH_API_URL;

      let { data: user } = await firstValueFrom(
        this.httpService.get(`${oauthApiUrl}/users/${userId}`),
      );

      user = user.data;

      const userRoles = user?.roles || [];
      const roleExists = userRoles.some((role: string) => role === roleName);

      if (!roleExists) {
        userRoles.push(roleName);
        await firstValueFrom(
          this.httpService.put(`${oauthApiUrl}/users/${userId}`, {
            roles: userRoles,
          }),
        );
      }
    } catch (error) {
      console.log('Failed to add role to user', error);

      throw new BadRequestException({
        message: 'Failed to assign role to user',
        error: error.response?.data?.message,
      });
    }
  }

  private async renameRoleForOAuthUser(
    userId: string,
    oldName: string,
    newName: string,
  ) {
    try {
      const oauthApiUrl = OAUTH_API_URL || process.env.OAUTH_API_URL;

      let { data: user } = await firstValueFrom(
        this.httpService.get(`${oauthApiUrl}/users/${userId}`),
      );

      user = user.data;
      const userRoles: string[] = user?.roles || [];

      const updatedRoles = userRoles.map((role: string) =>
        role === oldName ? newName : role,
      );

      await firstValueFrom(
        this.httpService.put(`${oauthApiUrl}/users/${userId}`, {
          roles: updatedRoles,
        }),
      );
    } catch (error) {
      console.log('Failed to rename role for user', error);

      throw new BadRequestException({
        message: 'Failed to rename role for user',
        error: error.response?.data?.message,
      });
    }
  }

  async delete(id: string, loginUser?: any) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        roleMenus: true,
        userRoles: true,
      },
    });

    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (role.createdBy === 'SYSTEM') {
      throw new BadRequestException('Role is not deletable');
    }

    if (role?.roleMenus?.length > 0) {
      throw new BadRequestException('Role is associated with permissions');
    }

    if (role?.userRoles?.length > 0) {
      throw new BadRequestException('Role is associated with users');
    }

    const deletedRole = await this.prisma.role.delete({
      where: { id },
    });

    return {
      data: {
        ...deletedRole,
        isDeletable: deletedRole.createdBy !== 'SYSTEM',
        isEditable: deletedRole.createdBy !== 'SYSTEM',
      },
      message: 'Role deleted successfully',
    };
  }
}
