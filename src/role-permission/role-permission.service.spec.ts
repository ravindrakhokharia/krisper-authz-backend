import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionService } from './role-permission.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../shared/services/validation.service';
import { HelperServices } from '../shared/helper/helper.services';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { QueryRolePermissionDto } from './dto/query-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

describe('RolePermissionService', () => {
  let service: RolePermissionService;
  let prisma: jest.Mocked<PrismaService>;
  let validationService: jest.Mocked<ValidationService>;
  let helperService: jest.Mocked<HelperServices>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      rolePermission: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      } as any,
    };

    const validationMock: Partial<jest.Mocked<ValidationService>> = {
      validateReferences: jest.fn().mockResolvedValue(undefined),
    };

    const helperMock: Partial<jest.Mocked<HelperServices>> = {
      reloadModuleCasbin: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ValidationService, useValue: validationMock },
        { provide: HelperServices, useValue: helperMock },
      ],
    }).compile();

    service = module.get<RolePermissionService>(RolePermissionService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    validationService = module.get(
      ValidationService,
    ) as jest.Mocked<ValidationService>;
    helperService = module.get(HelperServices) as jest.Mocked<HelperServices>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('validates, creates, reloads casbin, returns result', async () => {
      const dto: CreateRolePermissionDto = {
        roleId: 'role-1',
        permissionId: 'perm-1',
      } as any;
      const created = {
        id: 'rp-1',
        permission: { resource: { module: 'sales' } },
      } as any;
      (prisma.rolePermission.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);

      expect(validationService.validateReferences).toHaveBeenCalledWith({
        roleId: 'role-1',
        permissionId: 'perm-1',
      });
      expect(prisma.rolePermission.create).toHaveBeenCalledWith({
        data: dto,
        include: {
          permission: { include: { resource: true } },
        },
      });
      expect(helperService.reloadModuleCasbin).toHaveBeenCalledWith('sales');
      expect(res).toEqual({ data: created, message: 'Role permission created successfully' });
    });

    it('propagates validation errors and does not create', async () => {
      const dto: CreateRolePermissionDto = {
        roleId: 'role-x',
        permissionId: 'perm-y',
      } as any;
      const err = new Error('Invalid refs');
      validationService.validateReferences.mockRejectedValueOnce(err);

      await expect(service.create(dto)).rejects.toThrow(err);
      expect(prisma.rolePermission.create).not.toHaveBeenCalled();
      expect(helperService.reloadModuleCasbin).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('no filters defaults limit/offset', async () => {
      const query: QueryRolePermissionDto = {} as any;
      const items = [{ id: 'rp1' }] as any[];
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(items);
      (prisma.rolePermission.count as jest.Mock).mockResolvedValue(1);

      const res = await service.findAll(query);
      expect(prisma.rolePermission.findMany).toHaveBeenCalled();
      expect(res).toEqual({ data: items, pagination: { offset: undefined, limit: undefined, total: 1 } });
    });

    it('applies roleId and pagination', async () => {
      const query: QueryRolePermissionDto = {
        roleId: 'r1',
        limit: 10,
        offset: 2,
      } as any;
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.rolePermission.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { roleId: 'r1' },
        skip: 2,
        take: 10,
      });
    });

    it('applies permissionId filter', async () => {
      const query: QueryRolePermissionDto = { permissionId: 'p1' } as any;
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.rolePermission.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.rolePermission.findMany).toHaveBeenCalled();
    });

    it('applies both filters', async () => {
      const query: QueryRolePermissionDto = {
        roleId: 'r1',
        permissionId: 'p1',
      } as any;
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.rolePermission.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.rolePermission.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns by id', async () => {
      const item = { id: 'rp-123' } as any;
      (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(item);
      const res = await service.findOne('rp-123');
      expect(prisma.rolePermission.findUnique).toHaveBeenCalledWith({
        where: { id: 'rp-123' },
      });
      expect(res).toEqual({ data: item, message: 'Role permission fetched successfully' });
    });
  });

  describe('update', () => {
    it('returns update message', () => {
      const res = service.update('id-1', {} as UpdateRolePermissionDto);
      expect(res).toBe('This action updates a #id-1 rolePermission');
    });
  });

  describe('remove', () => {
    it('returns remove message', () => {
      const res = service.remove('id-2');
      expect(res).toBe('This action removes a #id-2 rolePermission');
    });
  });
});
