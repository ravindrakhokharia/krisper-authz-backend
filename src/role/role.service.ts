import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
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

  async create(createRoleDto: CreateRoleDto, loginUserId?: string) {
    const userIds = [...new Set(createRoleDto.userIds || [])];
    const menuIds = [...new Set(createRoleDto.menuIds || [])];

    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      return {
        data: existingRole,
        message: 'Role already exists',
      };
    }

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const { data } = await firstValueFrom(
          this.httpService.get(`${OAUTH_API_URL}/users/${userId}`),
        );

        if (!data) {
          throw new BadRequestException(`Invalid user: ${userId}`);
        }

        return data;
      }),
    );

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
      data: role,
      message: 'Role created successfully',
    };
  }

  async findAll(loginUser?: any) {
    const isSuperAdmin = loginUser?.roles?.includes('Super Admin');
    const whereClause =
      isSuperAdmin || !loginUser
        ? {}
        : {
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
      isAssigned: role.userRoles.some((ur) => ur.userId === loginUser?.id),
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
    return { data: role, message: 'Role fetched successfully' };
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
    return { data: role, message: 'Role fetched successfully' };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { menuIds = [], userIds = [], ...roleData } = updateRoleDto;

    const existingRoleWithSameName = await this.prisma.role.findUnique({
      where: { name: updateRoleDto.name },
    });

    if (existingRoleWithSameName && existingRoleWithSameName.id !== id) {
      throw new BadRequestException('Role name already exists');
    }

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

    const existingMenuIds = existingRole.roleMenus.map((m) => m.menuId);
    const existingUserIds = existingRole.userRoles.map((u) => u.userId);

    const menuSet = new Set(menuIds);
    const existingMenuSet = new Set(existingMenuIds);

    const userSet = new Set(userIds);
    const existingUserSet = new Set(existingUserIds);

    const menusToAdd = menuIds?.filter((id) => !existingMenuSet.has(id));
    const menusToRemove = existingMenuIds?.filter((id) => !menuSet.has(id));

    const usersToAdd = userIds?.filter((id) => !existingUserSet.has(id));
    const usersToRemove = existingUserIds?.filter((id) => !userSet.has(id));

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

    const oldName = existingRole.name;
    const newName = updateRoleDto.name || role.name;
    const isRenamed = updateRoleDto.name && updateRoleDto.name !== oldName;

    // Users being removed: remove the OLD role name from their OAuth roles[]
    await Promise.all(
      usersToRemove.map((userId) =>
        this.removeRoleFromOAuthUser(userId, oldName),
      ),
    );

    // Users being added: add the NEW role name to their OAuth roles[]
    await Promise.all(
      usersToAdd.map((userId) => this.addRoleToOAuthUser(userId, newName)),
    );

    // If the role was renamed, directly replace old name with new name for all staying users
    if (isRenamed) {
      const stayingUserIds = existingUserIds.filter(
        (uid) => !usersToRemove.includes(uid),
      );
      await Promise.all(
        stayingUserIds.map((userId) =>
          this.renameRoleForOAuthUser(userId, oldName, newName),
        ),
      );
    }

    return {
      data: role,
      message: 'Role updated successfully',
    };
  }

  private async removeRoleFromOAuthUser(userId: string, roleName: string) {
    try {
      const oauthApiUrl = OAUTH_API_URL;

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
      const oauthApiUrl = OAUTH_API_URL;

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
      const oauthApiUrl = OAUTH_API_URL;

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

    if (role.name === 'Super Admin') {
      const isSuperAdmin = loginUser?.roles?.includes('Super Admin');
      console.log('isSuperAdmin', isSuperAdmin);
      if (!isSuperAdmin) {
        throw new BadRequestException(
          'Only Super Admin can delete the Super Admin role',
        );
      }
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
      data: deletedRole,
      message: 'Role deleted successfully',
    };
  }
}
