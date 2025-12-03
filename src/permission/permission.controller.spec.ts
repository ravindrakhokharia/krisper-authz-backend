import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: jest.Mocked<PermissionService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<PermissionService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [{ provide: PermissionService, useValue: serviceMock }],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    service = module.get(PermissionService) as jest.Mocked<PermissionService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service', async () => {
      const dto: CreatePermissionDto = {
        actionId: 'a1',
        resourceId: 'r1',
      } as any;
      const created = { id: 'p1', ...dto } as any;
      service.create.mockResolvedValue(created);

      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('delegates with query', async () => {
      const query: QueryPermissionDto = { actionId: 'a1', limit: 5 } as any;
      const list = [{ id: 'p1' }] as any[];
      service.findAll.mockResolvedValue(list);

      const res = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(res).toBe(list);
    });
  });

  describe('findOne', () => {
    it('delegates with id', async () => {
      const item = { id: 'p1' } as any;
      service.findOne.mockResolvedValue(item);

      const res = await controller.findOne('p1');
      expect(service.findOne).toHaveBeenCalledWith('p1');
      expect(res).toBe(item);
    });
  });

  describe('update', () => {
    it('delegates with id and dto', () => {
      const dto: UpdatePermissionDto = { actionId: 'a2' } as any;
      service.update.mockReturnValue('ok' as any);

      const res = controller.update('p1', dto);
      expect(service.update).toHaveBeenCalledWith('p1', dto);
      expect(res).toBe('ok');
    });
  });

  describe('remove', () => {
    it('delegates with id', () => {
      service.remove.mockReturnValue('removed' as any);

      const res = controller.remove('p1');
      expect(service.remove).toHaveBeenCalledWith('p1');
      expect(res).toBe('removed');
    });
  });
});
