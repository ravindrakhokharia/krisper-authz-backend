import { Injectable } from '@nestjs/common';
import { CreateRoleMenuDto } from './dto/create-role-menu.dto';
import { UpdateRoleMenuDto } from './dto/update-role-menu.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryRoleMenuDto } from './dto/query-role-menu.dto';

@Injectable()
export class RoleMenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createRoleMenuDto: CreateRoleMenuDto) {
    const { roleId, menuId } = createRoleMenuDto;

    await this.validationService.validateReferences({
      roleId,
      menuId,
    });

    const roleMenu = await this.prisma.roleMenu.create({
      data: createRoleMenuDto,
      include: {
        role: true,
        menu: true,
      },
    });

    return {
      data: roleMenu,
      message: 'Role menu created successfully',
    };
  }

  async findAll(query: QueryRoleMenuDto) {
    const { roleId, menuId, limit, offset } = query;
    const whereClause: Record<string, any> = {};

    if (roleId) {
      whereClause.roleId = roleId;
    }
    if (menuId) {
      whereClause.menuId = menuId;
    }

    const roleMenus = await this.prisma.roleMenu.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });
    const total = await this.prisma.roleMenu.count({
      where: whereClause,
    });
    return { data: roleMenus, pagination: { offset, limit, total } };
  }

  findOne(id: string) {
    const roleMenu = this.prisma.roleMenu.findUnique({
      where: { id },
    });
    return {
      data: roleMenu,
      message: 'Role menu fetched successfully',
    };
  }

  // update(id: string, updateRoleMenuDto: UpdateRoleMenuDto) {
  //   return `This action updates a #${id} roleMenu`;
  // }

  // remove(id: string) {
  //   return `This action removes a #${id} roleMenu`;
  // }
}
