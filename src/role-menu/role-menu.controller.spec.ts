import { Test, TestingModule } from '@nestjs/testing';
import { RoleMenuController } from './role-menu.controller';
import { RoleMenuService } from './role-menu.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRoleMenuDto } from './dto/create-role-menu.dto';
import { QueryRoleMenuDto } from './dto/query-role-menu.dto';
import { UpdateRoleMenuDto } from './dto/update-role-menu.dto';

describe('RoleMenuController', () => {
  let controller: RoleMenuController;
  let service: jest.Mocked<RoleMenuService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleMenuController],
      providers: [{ provide: RoleMenuService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleMenuController>(RoleMenuController);
    service = module.get(RoleMenuService) as jest.Mocked<RoleMenuService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto: CreateRoleMenuDto = { roleId: 'r1', menuId: 'm1' };
      const expectedResult = { data: { id: '1', ...dto }, message: 'success' };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query', async () => {
      const query: QueryRoleMenuDto = { roleId: 'r1' } as any;
      const expectedResult = { data: [], pagination: {} };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const id = '1';
      const expectedResult = {
        data: Promise.resolve({ id }),
        message: 'success',
      };
      service.findOne.mockReturnValue(expectedResult as any);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  // describe('update', () => {
  //   it('should call service.update with id and dto', async () => {
  //     const id = '1';
  //     const dto: UpdateRoleMenuDto = { menuId: 'm2' };
  //     const expectedResult = { data: { id, ...dto }, message: 'success' };
  //     service.update.mockResolvedValue(expectedResult as any);

  //     const result = await controller.update(id, dto);

  //     expect(service.update).toHaveBeenCalledWith(id, dto);
  //     expect(result).toEqual(expectedResult);
  //   });
  // });

  // describe('remove', () => {
  //   it('should call service.remove with id', async () => {
  //     const id = '1';
  //     const expectedResult = { data: { id }, message: 'success' };
  //     service.remove.mockResolvedValue(expectedResult as any);

  //     const result = await controller.remove(id);

  //     expect(service.remove).toHaveBeenCalledWith(id);
  //     expect(result).toEqual(expectedResult);
  //   });
  // });
});
