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

    return permission;
  }

  async findAll(query: QueryPermissionDto) {
    const { actionId, resourceId, limit = 100, offset = 0 } = query;
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
    return permissions;
  }

  findOne(id: string) {
    const permission = this.prisma.permission.findUnique({
      where: { id },
    });
    return permission;
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: string) {
    return `This action removes a #${id} permission`;
  }
}
