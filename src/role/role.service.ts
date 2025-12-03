import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
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
    return `This action updates a #${id} role`;
  }

  async remove(id: string) {
    return `This action removes a #${id} role`;
  }
}
