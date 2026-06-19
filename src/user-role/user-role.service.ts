import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly validationService: ValidationService,
  ) {}
  async create(createUserRoleDto: CreateUserRoleDto, loginUser?: any) {
    await this.validationService.validateReferences({
      roleId: createUserRoleDto.roleId,
    });

    const targetRole = await this.prisma.role.findUnique({
      where: { id: createUserRoleDto.roleId },
    });

    if (!targetRole) {
      throw new BadRequestException('Role not found');
    }

    const oauthApiUrl = process.env.OAUTH_API_URL;
    let targetUser: any;
    try {
      const userResponse = await firstValueFrom(
        this.httpService.get<any>(
          `${oauthApiUrl}/users/${createUserRoleDto.userId}`,
        ),
      );
      targetUser = userResponse.data;
    } catch (err) {
      throw new BadRequestException('Invalid user ID or user not found');
    }

    const targetUserRoles: string[] = targetUser?.roles || [];
    const targetUserRolesLower = targetUserRoles.map((r) => r.toLowerCase());
    const isSuperAdminRole = targetRole.name.toLowerCase() === 'super admin';
    const isOwnerRole = targetRole.name.toLowerCase() === 'owner';

    // Enforce role assignment rules
    if (isSuperAdminRole) {
      const isLoginUserSuperAdmin = loginUser?.roles?.some(
        (r: string) => r.toLowerCase() === 'super admin',
      );
      if (!isLoginUserSuperAdmin) {
        throw new ForbiddenException('Only Super Admins can assign the Super Admin role.');
      }
      
      // Target user must not have other roles (except Owner)
      const hasIncompatibleRole = targetUserRolesLower.some(
        (r) => r !== 'owner' && r !== 'super admin',
      );
      if (hasIncompatibleRole) {
        throw new BadRequestException(
          'Super Admin role cannot be assigned to a user who already has other roles (Manager, HR, etc.).'
        );
      }
    } else if (!isOwnerRole) {
      // If assigning a non-Super Admin and non-Owner role, ensure the target user is not a Super Admin
      if (targetUserRolesLower.includes('super admin')) {
        throw new BadRequestException(`Cannot assign role "${targetRole.name}" to a Super Admin user.`);
      }
    }

    const userRole = await this.prisma.userRole.create({
      data: createUserRoleDto,
      include: { role: true },
    });

    try {
      const user = targetUser;
      if (!user.roles) {
        user.roles = [];
      }
      if (!user.roles.includes(userRole.role.name)) {
        user.roles.push(userRole.role.name);
      }

      await firstValueFrom(
        this.httpService.put<any>(`${oauthApiUrl}/users/${user.id}`, {
          ...user,
        }),
      );
    } catch (error) {
      // Rollback database record if OAuth sync fails
      await this.prisma.userRole.delete({ where: { id: userRole.id } });
      console.log(error);

      if (error instanceof AxiosError) {
        throw new HttpException(
          {
            message: 'Failed to assign role to user',
            error: error.response?.data,
          },
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }

    return { data: userRole, message: 'Role assigned successfully' };
  }

  async findAll(query: QueryUserRoleDto) {
    const { userId, roleId, limit = 100, offset = 0 } = query;
    const whereClause: Record<string, any> = {};

    if (userId) {
      whereClause.userId = userId;
    }
    if (roleId) {
      whereClause.roleId = roleId;
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });

    const total = await this.prisma.userRole.count({ where: whereClause });
    return { data: userRoles, pagination: { offset, limit, total } };
  }

  async findOne(id: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id },
    });
    return { data: userRole, message: 'User role fetched successfully' };
  }

  update(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} rolePermission`;
  }

  remove(id: string) {
    return `This action removes a #${id} rolePermission`;
  }

  async removeByUser(userId: string) {
     await this.prisma.userRole.deleteMany({ where: { userId } });

     return { message: 'User role deleted successfully' };
  }
}
