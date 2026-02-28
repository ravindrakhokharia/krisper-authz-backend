import { Injectable } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryRolePermissionDto } from './dto/query-role-permission.dto';
import { HelperServices } from 'src/shared/helper/helper.services';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
    private readonly helperService: HelperServices,
  ) {}
  async create(createRolePermissionDto: CreateRolePermissionDto) {
    const { roleId, permissionId } = createRolePermissionDto;

    await this.validationService.validateReferences({
      roleId,
      permissionId,
    });

    const rolePermission = await this.prisma.rolePermission.create({
      data: createRolePermissionDto,
      include: {
        permission: {
          include: {
            resource: true,
          },
        },
      },
    });

    const moduleName = rolePermission.permission.resource.module;

    await this.helperService.reloadModuleCasbin(moduleName);

    return {
      data: rolePermission,
      message: 'Role permission created successfully',
    };
  }

  async findAll(query: QueryRolePermissionDto) {
    const { roleId, permissionId, limit, offset } = query;
    const whereClause: Record<string, any> = {};

    if (roleId) {
      whereClause.roleId = roleId;
    }
    if (permissionId) {
      whereClause.permissionId = permissionId;
    }
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });
    const total = await this.prisma.rolePermission.count({
      where: whereClause,
    });
    return { data: rolePermissions, pagination: { offset, limit, total } };
  }

  findOne(id: string) {
    const rolePermission = this.prisma.rolePermission.findUnique({
      where: { id },
    });
    return {
      data: rolePermission,
      message: 'Role permission fetched successfully',
    };
  }

  update(id: string, updateRolePermissionDto: UpdateRolePermissionDto) {
    return `This action updates a #${id} rolePermission`;
  }

  remove(id: string) {
    return `This action removes a #${id} rolePermission`;
  }
}
