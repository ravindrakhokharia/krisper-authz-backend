import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';

@Injectable()
export class PermissionListService {
  constructor(private readonly prisma: PrismaService) {}

  async permissionList(query: QueryPermissionListDto) {
    const { module, offset, limit } = query;
    const data = await this.prisma.rolePermission.findMany({
      where: module
        ? {
            permission: {
              resource: {
                module: module,
              },
            },
          }
        : {},
      include: {
        permission: {
          include: {
            resource: true,
            action: true,
          },
        },
        role: true,
      },
      skip: offset,
      take: limit,
    });

    const result = data.map((item) => ({
      module: item.permission.resource.module,
      role: item.role.name,
      resource: item.permission.resource.name,
      action: item.permission.action.name,
    }));

    return { data: result };
  }
}
