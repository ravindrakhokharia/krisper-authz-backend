import { Test, TestingModule } from '@nestjs/testing';
import { ResourceService } from './resource.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { BadRequestException } from '@nestjs/common';

describe('ResourceService', () => {
  let service: ResourceService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      resource: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ResourceService>(ResourceService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws when module invalid', async () => {
      const dto: CreateResourceDto = {
        module: 'invalid',
        name: 'res',
        description: 'desc',
      } as any;
      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.resource.create).not.toHaveBeenCalled();
    });

    it('creates resource when valid module', async () => {
      const dto: CreateResourceDto = {
        module: 'hr',
        name: 'employees',
        description: 'Employee resource',
      } as any;
      const created = { id: 'r1', ...dto } as any;
      (prisma.resource.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);
      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(res).toEqual({ data: created, message: 'Resource created successfully' });
    });
  });

  describe('findAll', () => {
    it('returns with no filter', async () => {
      const query: QueryResourceDto = { limit: 20, offset: 0 } as any;
      const data = [{ id: 'r1' }] as any[];
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(data);

      (prisma.resource.count as jest.Mock).mockResolvedValue(10);

      const res = await service.findAll(query);
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
      });
      expect(res).toEqual({ data, pagination: { offset: 0, limit: 20, total: 10 }});
    });

    it('filters by module', async () => {
      const query: QueryResourceDto = {
        module: 'sales',
        limit: 5,
        offset: 2,
      } as any;
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.resource.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(query);
      expect(prisma.resource.findMany).toHaveBeenCalledWith({
        where: { module: 'sales' },
        skip: 2,
        take: 5,
      });
    });
  });

  describe('findOne', () => {
    it('returns unique resource by id', async () => {
      const item = { id: 'r-123' } as any;
      (prisma.resource.findUnique as jest.Mock).mockResolvedValue(item);

      const res = await service.findOne('r-123');
      expect(prisma.resource.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-123' },
      });
      expect(res).toEqual({ data: item, message: 'Resource fetched successfully' });
    });
  });

  describe('update', () => {
    it('returns update message', async () => {
      const res = await service.update('id-1', {} as UpdateResourceDto);
      expect(res).toBe('This action updates a #id-1 resource');
    });
  });

  describe('remove', () => {
    it('returns remove message', async () => {
      const res = await service.remove('id-2');
      expect(res).toBe('This action removes a #id-2 resource');
    });
  });
});
