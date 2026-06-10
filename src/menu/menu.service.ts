import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { HelperServices } from '../shared/helper/helper.services';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperServices,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const capitalize = this.helperService.capitalize.bind(this.helperService);
    const existMenu = await this.prisma.menu.findUnique({
      where: {
        name: capitalize(createMenuDto.name),
      },
    });

    if (existMenu) {
      return existMenu;
    }

    const menu = await this.prisma.menu.create({
      data: {
        name: capitalize(createMenuDto.name),
        icon: createMenuDto.icon,
      },
    });
    return { data: menu, message: 'Menu created successfully' };
  }

  async findAll() {
    const menus = await this.prisma.menu.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return { data: menus, message: 'Menus fetched successfully' };
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    return { data: menu, message: 'Menu fetched successfully' };
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
    return { data: menu, message: 'Menu updated successfully' };
  }

  async remove(id: string) {
    const menu = await this.prisma.menu.delete({
      where: { id },
    });
    return { data: menu, message: 'Menu deleted successfully' };
  }

  async findUserModule(id: string) {
    const userRole = await this.prisma.userRole.findMany({
      where: {
        userId: id,
      },
    });

    const roleIds = userRole.map((ur) => ur.roleId);

    const roleMenu = await this.prisma.roleMenu.findMany({
      where: {
        roleId: { in: roleIds },
      },
      include: {
        menu: true,
      },
    });

    const totalModules = roleMenu.length;

    return {
      data: roleMenu,
      total: totalModules,
      message: 'User modules fetched successfully',
    };
  }
}
