import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleController } from './user-role.controller';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { QueryUserRoleDto } from './dto/query-user-role.dto';

describe('UserRoleController', () => {
  let controller: UserRoleController;
  let service: jest.Mocked<UserRoleService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<UserRoleService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleController],
      providers: [{ provide: UserRoleService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UserRoleController>(UserRoleController);
    service = module.get(UserRoleService) as jest.Mocked<UserRoleService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service', async () => {
      const dto: CreateUserRoleDto = { userId: 'u1', roleId: 'r1' } as any;
      const created = { id: 'ur1', ...dto } as any;
      service.create.mockResolvedValue(created);
      const req = { user: { id: 'u1' } };
      const res = await controller.create(dto, req as any);
      expect(service.create).toHaveBeenCalledWith(dto, req.user);
      expect(res).toBe(created);
    });
  });

  describe('findAll', () => {
    it('delegates with query', async () => {
      const query: QueryUserRoleDto = { userId: 'u1', limit: 5 } as any;
      const list = [{ id: 'ur1' }] as any[];
      service.findAll.mockResolvedValue(list);
      const res = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(res).toBe(list);
    });
  });

  describe('findOne', () => {
    it('delegates with id', async () => {
      const item = { id: 'ur1' } as any;
      service.findOne.mockResolvedValue(item);
      const res = await controller.findOne('ur1');
      expect(service.findOne).toHaveBeenCalledWith('ur1');
      expect(res).toBe(item);
    });
  });

  describe('update', () => {
    it('delegates with id and dto', () => {
      const dto: UpdateUserRoleDto = { roleId: 'r2' } as any;
      service.update.mockReturnValue('ok' as any);
      const res = controller.update('ur1', dto);
      expect(service.update).toHaveBeenCalledWith('ur1', dto);
      expect(res).toBe('ok');
    });
  });

  describe('remove', () => {
    it('delegates with id', () => {
      service.remove.mockReturnValue('removed' as any);
      const res = controller.remove('ur1');
      expect(service.remove).toHaveBeenCalledWith('ur1');
      expect(res).toBe('removed');
    });
  });

  describe('removeByUser', () => {
    it('delegates with userId', async () => {
      service.removeByUser.mockResolvedValue({ message: 'User role deleted successfully' } as any);
      const res = await controller.removeByUser('u1');
      expect(service.removeByUser).toHaveBeenCalledWith('u1');
      expect(res).toEqual({ message: 'User role deleted successfully' });
    });
  });
});
