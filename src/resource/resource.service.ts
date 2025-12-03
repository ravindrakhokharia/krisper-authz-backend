import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { modules } from 'src/shared/constants/constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryResourceDto } from './dto/query-resource.dto';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto) {
    const { module, name, description } = createResourceDto;
    if (!module || !modules.includes(module)) {
      throw new BadRequestException('Invalid module name');
    }

    const resource = await this.prisma.resource.create({
      data: {
        module,
        name,
        description,
      },
    });

    return resource;
  }

  async findAll(query: QueryResourceDto) {
    const whereClause: any = {};
    if (query.module) {
      whereClause.module = query.module;
    }

    const resources = await this.prisma.resource.findMany({
      where: whereClause,
      skip: query.offset,
      take: query.limit,
    });
    return resources;
  }

  findOne(id: string) {
    const resource = this.prisma.resource.findUnique({
      where: { id },
    });
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    return `This action updates a #${id} resource`;
  }

  async remove(id: string) {
    return `This action removes a #${id} resource`;
  }
}
