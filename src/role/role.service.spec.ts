import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: jest.Mocked<PrismaService>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any,
      roleMenu: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      } as any,
      userRole: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      } as any,
      $transaction: jest.fn().mockImplementation((cb) => cb(prismaMock)),
    };

    const httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpService, useValue: httpMock },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    httpService = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a role', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
      } as any;
      const created = { id: 'r1', ...dto } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);
      expect(prisma.role.findUnique).toHaveBeenCalled();
      expect(res).toEqual({ data: created, message: 'Role created successfully' });
    });

    it('saves loginUserId in createdBy fields', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
        userIds: ['u1'],
        menuIds: ['m1'],
      } as any;
      const created = { id: 'r1', ...dto } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(created);
      httpService.get.mockReturnValue(of({ data: { data: { id: 'u1' } } } as any));
      httpService.put.mockReturnValue(of({ data: {} } as any));

      await service.create(dto, 'user-123');

      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdBy: 'user-123',
            roleMenus: {
              createMany: {
                data: [{ menuId: 'm1', createdBy: 'user-123' }],
                skipDuplicates: true,
              },
            },
            userRoles: {
              createMany: {
                data: [{ userId: 'u1', createdBy: 'user-123' }],
                skipDuplicates: true,
              },
            },
          }),
        }),
      );
    });

    it('should return existing role if name already exists', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
      } as any;
      const existing = { id: 'r1', ...dto } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);

      const res = await service.create(dto);
      expect(prisma.role.findUnique).toHaveBeenCalled();
      expect(prisma.role.create).not.toHaveBeenCalled();
      expect(res).toEqual({ data: existing, message: 'Role already exists' });
    });

    it('should handle userIds and menuIds deduplication and OAuth sync', async () => {
      const dto: CreateRoleDto = {
        name: 'staff',
        userIds: ['u1', 'u1', 'u2'],
        menuIds: ['m1', 'm2', 'm1'],
      } as any;
      const created = { id: 'r2', name: 'staff' } as any;

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(created);
      httpService.get.mockImplementation((url) => {
        const id = url.split('/').pop();
        return of({
          data: { data: { id, roles: [] } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any);
      });
      httpService.put.mockReturnValue(
        of({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      const res = await service.create(dto);

      expect(httpService.get).toHaveBeenCalledTimes(4); // 2 for validation, 2 for sync
      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roleMenus: {
              createMany: {
                data: [{ menuId: 'm1' }, { menuId: 'm2' }],
                skipDuplicates: true,
              },
            },
            userRoles: {
              createMany: {
                data: [{ userId: 'u1' }, { userId: 'u2' }],
                skipDuplicates: true,
              },
            },
          }),
        }),
      );
      expect(httpService.put).toHaveBeenCalledTimes(2);
      expect(res.data).toEqual(created);
    });

    it('should throw BadRequestException if user data is missing from OAuth', async () => {
      const dto: CreateRoleDto = { name: 'staff', userIds: ['u1'] } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      httpService.get.mockReturnValue(
        of({
          data: null,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle missing userIds and menuIds in dto', async () => {
      const dto: CreateRoleDto = { name: 'guest' } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue({ id: 'r3', name: 'guest' });

      await service.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            roleMenus: { createMany: { data: [], skipDuplicates: true } },
            userRoles: { createMany: { data: [], skipDuplicates: true } },
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns all roles', async () => {
      const items = [{ id: 'r1' }, { id: 'r2' }] as any[];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(items);
      const res = await service.findAll();
      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(res).toEqual({ data: items, message: 'Roles fetched successfully' });
    });

    it('returns empty array if no roles found', async () => {
      (prisma.role.findMany as jest.Mock).mockResolvedValue(null);
      const res = await service.findAll();
      expect(res).toEqual({ data: [], message: 'Roles fetched successfully' });
    });

    it('returns empty array if roles is undefined', async () => {
      (prisma.role.findMany as jest.Mock).mockResolvedValue(undefined);
      const res = await service.findAll();
      expect(res).toEqual({ data: [], message: 'Roles fetched successfully' });
    });

    it('returns all roles for Super Admin user', async () => {
      const items = [{ id: 'r1' }] as any[];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(items);
      const res = await service.findAll({ id: 'u1', roles: ['Super Admin'] });
      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(res).toEqual({ data: items, message: 'Roles fetched successfully' });
    });

    it('returns only created or assigned roles for non-Super Admin user', async () => {
      const items = [{ id: 'r1', createdBy: 'u1' }] as any[];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(items);
      const res = await service.findAll({ id: 'u1', roles: ['Regular User'] });
      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { createdBy: 'u1' },
              {
                userRoles: {
                  some: {
                    userId: 'u1',
                  },
                },
              },
            ],
          },
        }),
      );
      expect(res).toEqual({ data: items, message: 'Roles fetched successfully' });
    });
  });

  describe('findOne', () => {
    it('returns role by id', async () => {
      const item = { id: 'r-123' } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(item);

      const res = await service.findOne('r-123');
      expect(prisma.role.findUnique).toHaveBeenCalled();
      expect(res).toEqual({ data: item, message: 'Role fetched successfully' });
    });

    it('throws BadRequestException if role not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOneByName', () => {
    it('returns role by name', async () => {
      const item = { id: 'r1', name: 'admin' } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(item);

      const res = await service.findOneByName('admin');
      expect(prisma.role.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: 'admin' } }),
      );
      expect(res).toEqual({ data: item, message: 'Role fetched successfully' });
    });

    it('throws BadRequestException if role name not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOneByName('unknown')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('updates a role', async () => {
      const dto: UpdateRoleDto = { description: 'New description' };
      const updated = { id: 'id-1', name: 'admin', ...dto } as any;
      (prisma.role.update as jest.Mock).mockResolvedValue(updated);

      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'id-1',
        roleMenus: [],
        userRoles: [],
      });
      const res = await service.update('id-1', dto);
      expect(prisma.role.update).toHaveBeenCalled();
      expect(res).toEqual({ data: updated, message: 'Role updated successfully' });
    });

    it('throws BadRequestException if role to update is not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.update('id-x', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('handles complex updates with user/menu additions and removals', async () => {
      const existing = {
        id: 'r1',
        name: 'admin',
        roleMenus: [{ menuId: 'm1' }, { menuId: 'm2' }],
        userRoles: [{ userId: 'u1' }, { userId: 'u2' }],
      } as any;
      const dto: UpdateRoleDto = {
        menuIds: ['m2', 'm3'],
        userIds: ['u2', 'u3'],
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', ...dto });

      // Mocking OAuth responses
      httpService.get.mockReturnValue(
        of({
          data: { data: { id: 'u1', roles: ['admin'] } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );
      httpService.put.mockReturnValue(
        of({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      await service.update('r1', dto);

      // Verify Prisma deletions/creations
      expect(prisma.roleMenu.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { roleId: 'r1', menuId: { in: ['m1'] } } }),
      );
      expect(prisma.roleMenu.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: [{ roleId: 'r1', menuId: 'm3' }] }),
      );
      expect(prisma.userRole.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { roleId: 'r1', userId: { in: ['u1'] } } }),
      );
      expect(prisma.userRole.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: [{ roleId: 'r1', userId: 'u3' }] }),
      );

      // Verify OAuth sync (one removal, one addition)
      expect(httpService.put).toHaveBeenCalledTimes(2);
    });

    it('uses existing role name if name is not provided in update dto', async () => {
        const existing = { id: 'r1', name: 'admin', roleMenus: [], userRoles: [] } as any;
        const dto: UpdateRoleDto = { description: 'Updated' };
        (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
        (prisma.role.update as jest.Mock).mockResolvedValue({ ...existing, ...dto });

        await service.update('r1', dto);
        // No OAuth calls expected since users haven't changed, but code path should use existing.name
    });
  });

  describe('OAuth methods error handling', () => {
    it('throws BadRequestException on addRoleToOAuthUser failure', async () => {
      const existing = { id: 'r1', roleMenus: [], userRoles: [] } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', name: 'admin' });

      httpService.get.mockReturnValue(
        of({
          data: { data: { id: 'u1', roles: [] } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );
      httpService.put.mockImplementation(() => {
        throw { response: { data: { message: 'OAuth Error' } } };
      });

      await expect(service.update('r1', { userIds: ['u1'] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException on removeRoleFromOAuthUser failure', async () => {
      const existing = { id: 'r1', roleMenus: [], userRoles: [{ userId: 'u1' }] } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', name: 'admin' });

      httpService.get.mockReturnValue(
        of({
          data: { data: { id: 'u1', roles: ['admin'] } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );
      httpService.put.mockImplementation(() => {
        throw new Error('OAuth Error');
      });

      await expect(service.update('r1', { userIds: [] })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('skips adding role if it already exists on OAuth user', async () => {
      const existing = { id: 'r1', roleMenus: [], userRoles: [] } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', name: 'admin' });

      httpService.get.mockReturnValue(
        of({
          data: { data: { id: 'u1', roles: ['admin'] } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any),
      );

      await service.update('r1', { userIds: ['u1'] });

      expect(httpService.get).toHaveBeenCalled();
      expect(httpService.put).not.toHaveBeenCalled();
    });

    it('handles missing roles field when adding role', async () => {
        const existing = { id: 'r1', roleMenus: [], userRoles: [] } as any;
        (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
        (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', name: 'admin' });

        httpService.get.mockReturnValue(
            of({ data: { data: { id: 'u1' } }, status: 200 } as any)
        );
        httpService.put.mockReturnValue(of({ data: {} } as any));

        await service.update('r1', { userIds: ['u1'] });
        expect(httpService.put).toHaveBeenCalledWith(expect.any(String), { roles: ['admin'] });
    });

    it('handles missing roles field when removing role', async () => {
        const existing = { id: 'r1', roleMenus: [], userRoles: [{ userId: 'u1' }] } as any;
        (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);
        (prisma.role.update as jest.Mock).mockResolvedValue({ id: 'r1', name: 'admin' });

        httpService.get.mockReturnValue(
            of({ data: { data: { id: 'u1' } }, status: 200 } as any)
        );
        httpService.put.mockReturnValue(of({ data: {} } as any));

        await service.update('r1', { userIds: [] });
        expect(httpService.put).toHaveBeenCalledWith(expect.any(String), { roles: [] });
    });
  });

  describe('delete', () => {
    it('removes a role', async () => {
      const deleted = { id: 'id-2', name: 'user' } as any;
      (prisma.role.delete as jest.Mock).mockResolvedValue(deleted);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'id-2',
        roleMenus: [],
        userRoles: [],
      });

      const res = await service.delete('id-2');
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'id-2' },
      });
      expect(res).toEqual({ data: deleted, message: 'Role deleted successfully' });
    });

    it('throws BadRequestException if role name is Super Admin and user is not Super Admin', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'super-admin-id',
        name: 'Super Admin',
        roleMenus: [],
        userRoles: [],
      });

      await expect(
        service.delete('super-admin-id', { roles: ['Regular User'] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows deleting Super Admin if the logged-in user is a Super Admin', async () => {
      const deleted = { id: 'super-admin-id', name: 'Super Admin' } as any;
      (prisma.role.delete as jest.Mock).mockResolvedValue(deleted);
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'super-admin-id',
        name: 'Super Admin',
        roleMenus: [],
        userRoles: [],
      });

      const res = await service.delete('super-admin-id', {
        roles: ['Super Admin'],
      });
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'super-admin-id' },
      });
      expect(res).toEqual({
        data: deleted,
        message: 'Role deleted successfully',
      });
    });

    it('throws BadRequestException if role to delete is not found', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('id-x')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if role has associated menus', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'r1',
        roleMenus: [{ menuId: 'm1' }],
        userRoles: [],
      });
      await expect(service.delete('r1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException if role has associated users', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue({
        id: 'r1',
        roleMenus: [],
        userRoles: [{ userId: 'u1' }],
      });
      await expect(service.delete('r1')).rejects.toThrow(BadRequestException);
    });
  });
});
