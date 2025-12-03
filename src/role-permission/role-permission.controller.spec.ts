import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { QueryRolePermissionDto } from './dto/query-role-permission.dto';

describe('RolePermissionController', () => {
  let controller: RolePermissionController;
  let service: jest.Mocked<RolePermissionService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<RolePermissionService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionController],
      providers: [{ provide: RolePermissionService, useValue: serviceMock }],
    }).compile();

    controller = module.get<RolePermissionController>(RolePermissionController);
    service = module.get(
      RolePermissionService,
    ) as jest.Mocked<RolePermissionService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service', async () => {
      const dto: CreateRolePermissionDto = {
        roleId: 'r1',
        permissionId: 'p1',
      } as any;
      const created = { id: 'rp1', ...dto } as any;
      service.create.mockResolvedValue(created);

      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('delegates with query', async () => {
      const query: QueryRolePermissionDto = { roleId: 'r1', limit: 5 } as any;
      const list = [{ id: 'rp1' }] as any[];
      service.findAll.mockResolvedValue(list);

      const res = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(res).toBe(list);
    });
  });

  describe('findOne', () => {
    it('delegates with id', async () => {
      const item = { id: 'rp1' } as any;
      service.findOne.mockResolvedValue(item);

      const res = await controller.findOne('rp1');
      expect(service.findOne).toHaveBeenCalledWith('rp1');
      expect(res).toBe(item);
    });
  });

  describe('update', () => {
    it('delegates with id and dto', () => {
      const dto: UpdateRolePermissionDto = { permissionId: 'p2' } as any;
      service.update.mockReturnValue('ok' as any);

      const res = controller.update('rp1', dto);
      expect(service.update).toHaveBeenCalledWith('rp1', dto);
      expect(res).toBe('ok');
    });
  });

  describe('remove', () => {
    it('delegates with id', () => {
      service.remove.mockReturnValue('removed' as any);

      const res = controller.remove('rp1');
      expect(service.remove).toHaveBeenCalledWith('rp1');
      expect(res).toBe('removed');
    });
  });
});
