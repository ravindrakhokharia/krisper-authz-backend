import { Test, TestingModule } from '@nestjs/testing';
import { PermissionListService } from './permission-list.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';

describe('PermissionListService', () => {
  let service: PermissionListService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      rolePermission: {
        findMany: jest.fn(),
      } as any, // Use 'any' to allow Jest mock methods
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionListService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PermissionListService>(PermissionListService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('permissionList', () => {
    it('fetches and maps results without module filter', async () => {
      const query: QueryPermissionListDto = { limit: 50, offset: 0 } as any;
      const data = [
        {
          permission: {
            resource: { module: 'sales', name: 'orders' },
            action: { name: 'read' },
          },
          role: { name: 'admin' },
        },
      ] as any[];
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue(data);

      const res = await service.permissionList(query);

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          permission: { include: { resource: true, action: true } },
          role: true,
        },
        skip: 0,
        take: 50,
      });
      expect(res).toEqual({ data: [
        {
          module: 'sales',
          role: 'admin',
          resource: 'orders',
          action: 'read',
        },
      ]});
    });

    it('applies module filter and pagination', async () => {
      const query: QueryPermissionListDto = {
        module: 'hr',
        limit: 10,
        offset: 5,
      } as any;
      (prisma.rolePermission.findMany as jest.Mock).mockResolvedValue([]);

      await service.permissionList(query);

      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: {
          permission: {
            resource: {
              module: 'hr',
            },
          },
        },
        include: {
          permission: { include: { resource: true, action: true } },
          role: true,
        },
        skip: 5,
        take: 10,
      });
    });
  });
});
