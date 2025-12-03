import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourceDto } from './dto/query-resource.dto';

describe('ResourceController', () => {
  let controller: ResourceController;
  let service: jest.Mocked<ResourceService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<ResourceService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [{ provide: ResourceService, useValue: serviceMock }],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
    service = module.get(ResourceService) as jest.Mocked<ResourceService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service', async () => {
      const dto: CreateResourceDto = {
        module: 'hr',
        name: 'employees',
        description: 'Employee resource',
      } as any;
      const created = { id: 'r1', ...dto } as any;
      service.create.mockResolvedValue(created);

      const res = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('delegates with query', async () => {
      const query: QueryResourceDto = { module: 'hr', limit: 10 } as any;
      const list = [{ id: 'r1' }] as any[];
      service.findAll.mockResolvedValue(list);

      const res = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
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
      const dto: UpdateResourceDto = { description: 'updated' } as any;
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
