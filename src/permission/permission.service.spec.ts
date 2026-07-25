import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../shared/services/validation.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

describe('PermissionService', () => {
  let service: PermissionService;
  let prisma: jest.Mocked<PrismaService>;
  let validationService: jest.Mocked<ValidationService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      permission: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      } as any,
    };

    const validationMock: Partial<jest.Mocked<ValidationService>> = {
      validateReferences: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ValidationService, useValue: validationMock },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    validationService = module.get(
      ValidationService,
    ) as jest.Mocked<ValidationService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('calls validation and creates permission', async () => {
      const dto: CreatePermissionDto = {
        actionId: 'act-1',
        resourceId: 'res-1',
      } as any;
      const created = { id: 'perm-1', ...dto } as any;
      (prisma.permission.create as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto);

      expect(validationService.validateReferences).toHaveBeenCalledWith({
        actionId: dto.actionId,
        resourceId: dto.resourceId,
      });
      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: dto,
      });
      expect(result).toEqual({
        data: created,
        message: 'Permission created successfully',
      });
    });

    it('propagates validation error', async () => {
      const dto: CreatePermissionDto = {
        actionId: 'act-x',
        resourceId: 'res-y',
      } as any;
      const err = new Error('Invalid references');
      validationService.validateReferences.mockRejectedValueOnce(err);

      await expect(service.create(dto)).rejects.toThrow(err);
      expect(prisma.permission.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all with defaults when no filters', async () => {
      const query: QueryPermissionDto = {} as any;
      const items = [{ id: 'p1' }, { id: 'p2' }] as any[];
      (prisma.permission.findMany as jest.Mock).mockResolvedValue(items);

      (prisma.permission.count as jest.Mock).mockResolvedValue(10);

      const result = await service.findAll(query);
      expect(prisma.permission.findMany).toHaveBeenCalled();
      expect(result).toEqual({
        data: items,
        pagination: { offset: undefined, limit: undefined, total: 10 },
      });
    });

    it('applies actionId filter', async () => {
      const query: QueryPermissionDto = { actionId: 'a1' } as any;
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([]);

      (prisma.permission.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(query);
      expect(prisma.permission.findMany).toHaveBeenCalled();
    });

    it('applies resourceId filter and pagination', async () => {
      const query: QueryPermissionDto = {
        resourceId: 'r1',
        limit: 10,
        offset: 5,
      } as any;
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([]);

      (prisma.permission.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(query);

      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        where: { resourceId: 'r1' },
        skip: 5,
        take: 10,
      });
    });

    it('applies both filters', async () => {
      const query: QueryPermissionDto = {
        actionId: 'a1',
        resourceId: 'r1',
      } as any;
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([]);

      (prisma.permission.count as jest.Mock).mockResolvedValue(0);

      await service.findAll(query);
      expect(prisma.permission.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns unique permission by id', async () => {
      const item = { id: 'perm-123' } as any;
      (prisma.permission.findUnique as jest.Mock).mockResolvedValue(item);

      const res = await service.findOne('perm-123');
      expect(prisma.permission.findUnique).toHaveBeenCalledWith({
        where: { id: 'perm-123' },
      });
      expect(res).toEqual({
        data: item,
        message: 'Permission fetched successfully',
      });
    });
  });

  describe('update', () => {
    it('returns update message', () => {
      const res = service.update('id-1', {} as UpdatePermissionDto);
      expect(res).toBe('This action updates a #id-1 permission');
    });
  });

  describe('remove', () => {
    it('returns remove message', () => {
      const res = service.remove('id-2');
      expect(res).toBe('This action removes a #id-2 permission');
    });
  });
});
