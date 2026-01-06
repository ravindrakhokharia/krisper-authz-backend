import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createRoleDto: CreateRoleDto) {
    const exitRole = await this.prisma.role.findUnique({
      where: {
        name: createRoleDto.name,
      },
    });

    if (exitRole) {
      return exitRole;
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });
    return role;
  }

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return roles;
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    return role;
  }

  async remove(id: string) {
    const role = await this.prisma.role.delete({
      where: { id },
    });
    return role;
  }
}
