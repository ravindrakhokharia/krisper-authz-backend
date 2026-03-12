import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleService } from './user-role.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationService } from '../shared/services/validation.service';
import { HttpService } from '@nestjs/axios';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { QueryUserRoleDto } from './dto/query-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AxiosError } from 'axios';

describe('UserRoleService', () => {
  let service: UserRoleService;
  let prisma: jest.Mocked<PrismaService>;
  let validationService: jest.Mocked<ValidationService>;
  let http: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      userRole: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      } as any,
    };

    const validationMock: Partial<jest.Mocked<ValidationService>> = {
      validateReferences: jest.fn().mockResolvedValue(undefined),
    };

    // Minimal HttpService mock: get/post/put return Observables via of()
    const httpMock: Partial<jest.Mocked<HttpService>> = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ValidationService, useValue: validationMock },
        { provide: HttpService, useValue: httpMock },
      ],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    validationService = module.get(
      ValidationService,
    ) as jest.Mocked<ValidationService>;
    http = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates userRole and performs OAuth/user updates', async () => {
      const dto: CreateUserRoleDto = {
        userId: 'u1',
        roleId: 'r1',
      } as any;
      const created = { id: 'ur-1', role: { name: 'admin' } } as any;
      (prisma.userRole.create as jest.Mock).mockResolvedValue(created);

      // Mock HTTP chain
      const userResp = { data: { id: 'u1', roles: [] } } as any;
      const updatedResp = { data: { ok: true } } as any;

      const { of } = require('rxjs');
      http.get.mockReturnValue(of(userResp));
      http.put.mockReturnValue(of(updatedResp));

      const res = await service.create(dto);

      expect(validationService.validateReferences).toHaveBeenCalledWith({
        roleId: 'r1',
      });
      expect(prisma.userRole.create as jest.Mock).toHaveBeenCalledWith({
        data: dto,
        include: { role: true },
      });
      expect(http.get).toHaveBeenCalled();
      expect(http.put).toHaveBeenCalled();
      expect(res).toEqual({ data: created, message: 'Role assigned successfully' });
    });

    it('throws HttpException for AxiosError from oauth calls', async () => {
      const dto: CreateUserRoleDto = { userId: 'u1', roleId: 'r1' } as any;
      (prisma.userRole.create as jest.Mock).mockResolvedValue({
        id: 'ur',
      } as any);
      const axiosErr = new AxiosError('bad', 'ERR', undefined, undefined, {
        status: 400,
        data: { msg: 'oops' },
      } as any);

      const { throwError } = require('rxjs');
      http.get.mockReturnValue(throwError(() => axiosErr));

      try {
        await service.create(dto);
        fail('Expected error to be thrown');
      } catch (err: any) {
        expect(err.getStatus ? err.getStatus() : err.status).toBe(400);
        const response = err.getResponse ? err.getResponse() : err.message;
        expect(response).toMatchObject({
          message: 'Failed to assign role to user',
          error: { msg: 'oops' },
        });
      }
    });

    it('rethrows non-AxiosError from oauth calls', async () => {
      const dto: CreateUserRoleDto = { userId: 'u1', roleId: 'r1' } as any;
      (prisma.userRole.create as jest.Mock).mockResolvedValue({
        id: 'ur',
      } as any);
      const genericErr = new Error('Generic failure');

      const { throwError } = require('rxjs');
      http.get.mockReturnValue(throwError(() => genericErr));

      await expect(service.create(dto)).rejects.toThrow('Generic failure');
    });

    it('uses INTERNAL_SERVER_ERROR when AxiosError has no response status', async () => {
      const dto: CreateUserRoleDto = { userId: 'u1', roleId: 'r1' } as any;
      (prisma.userRole.create as jest.Mock).mockResolvedValue({
        id: 'ur',
      } as any);
      const axiosErr = new AxiosError(
        'no response',
        'ERR',
        undefined,
        undefined,
        undefined,
      );

      const { throwError } = require('rxjs');
      http.get.mockReturnValue(throwError(() => axiosErr));

      try {
        await service.create(dto);
        fail('Expected error');
      } catch (err: any) {
        expect(err.getStatus()).toBe(500);
      }
    });
  });

  describe('findAll', () => {
    it('no filters with defaults', async () => {
      const query: QueryUserRoleDto = {} as any;
      const items = [{ id: 'ur1' }] as any[];
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue(items);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(1);
      const res = await service.findAll(query);
      expect(prisma.userRole.findMany).toHaveBeenCalled();
      expect(res).toEqual({ data: items, pagination: { offset: 0, limit: 100, total: 1 } });
    });

    it('filters by userId and pagination', async () => {
      const query: QueryUserRoleDto = {
        userId: 'u1',
        limit: 5,
        offset: 2,
      } as any;
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        skip: 2,
        take: 5,
      });
    });

    it('filters by roleId', async () => {
      const query: QueryUserRoleDto = { roleId: 'r1' } as any;
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { roleId: 'r1' },
        skip: 0,
        take: 100,
      });
    });

    it('filters by both', async () => {
      const query: QueryUserRoleDto = { userId: 'u1', roleId: 'r1' } as any;
      (prisma.userRole.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userRole.count as jest.Mock).mockResolvedValue(0);
      await service.findAll(query);
      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', roleId: 'r1' },
        skip: 0,
        take: 100,
      });
    });
  });

  describe('findOne', () => {
    it('returns by id', async () => {
      const item = { id: 'ur-123' } as any;
      (prisma.userRole.findUnique as jest.Mock).mockResolvedValue(item);
      const res = await service.findOne('ur-123');
      expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'ur-123' },
      });
      expect(res).toEqual({ data: item, message: 'User role fetched successfully' });
    });
  });

  describe('update', () => {
    it('returns update message', () => {
      const res = service.update('id-1', {} as UpdateUserRoleDto);
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
