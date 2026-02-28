import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { HelperServices } from 'src/shared/helper/helper.services';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperServices,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const capitalize = this.helperService.capitalize.bind(this.helperService);
    const exitRole = await this.prisma.role.findUnique({
      where: {
        name: capitalize(createRoleDto.name),
      },
    });

    if (exitRole) {
      return exitRole;
    }

    const role = await this.prisma.role.create({
      data: {
        name: capitalize(createRoleDto.name),
        description: createRoleDto.description,
      },
    });
    return { data: role, message: 'Role created successfully' };
  }

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return { data: roles, message: 'Roles fetched successfully' };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    return { data: role, message: 'Role fetched successfully' };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    return { data: role, message: 'Role updated successfully' };
  }

  async remove(id: string) {
    const role = await this.prisma.role.delete({
      where: { id },
    });
    return { data: role, message: 'Role deleted successfully' };
  }
}
