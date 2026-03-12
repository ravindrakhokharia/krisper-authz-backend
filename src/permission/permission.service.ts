import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryPermissionDto } from './dto/query-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: ValidationService,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const { actionId, resourceId } = createPermissionDto;

    await this.validationService.validateReferences({
      actionId,
      resourceId,
    });

    const permission = await this.prisma.permission.create({
      data: createPermissionDto,
    });

    return { data: permission, message: 'Permission created successfully' };
  }

  async findAll(query: QueryPermissionDto) {
    const { actionId, resourceId, limit, offset } = query;
    const whereClause: Record<string, any> = {};

    if (actionId) {
      whereClause.actionId = actionId;
    }
    if (resourceId) {
      whereClause.resourceId = resourceId;
    }
    const permissions = await this.prisma.permission.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
    });
    const total = await this.prisma.permission.count({ where: whereClause });
    return { data: permissions, pagination: { offset, limit, total } };
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    return { data: permission, message: 'Permission fetched successfully' };
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: string) {
    return `This action removes a #${id} permission`;
  }
}
