import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RoleController', () => {
  let controller: RoleController;
  let service: jest.Mocked<RoleService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<RoleService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useValue: serviceMock }],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get(RoleService) as jest.Mocked<RoleService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
      } as any;
      const created = { id: 'r1', ...dto } as any;
      service.create.mockResolvedValue(created);

      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('delegates and returns list', async () => {
      const list = [{ id: 'r1' }] as any[];
      service.findAll.mockResolvedValue(list);
      const res = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(res).toBe(list);
    });
  });

  describe('findOne', () => {
    it('delegates with id', async () => {
      const item = { id: 'r1' } as any;
      service.findOne.mockResolvedValue(item);
      const res = await controller.findOne('r1');
      expect(service.findOne).toHaveBeenCalledWith('r1');
      expect(res).toBe(item);
    });
  });

  describe('update', () => {
    it('delegates with id and dto', async () => {
      const dto: UpdateRoleDto = { description: 'updated' } as any;
      service.update.mockResolvedValue('ok' as any);
      const res = await controller.update('r1', dto);
      expect(service.update).toHaveBeenCalledWith('r1', dto);
      expect(res).toBe('ok');
    });
  });

  describe('remove', () => {
    it('delegates with id', async () => {
      service.remove.mockResolvedValue('removed' as any);
      const res = await controller.remove('r1');
      expect(service.remove).toHaveBeenCalledWith('r1');
      expect(res).toBe('removed');
    });
  });
});
