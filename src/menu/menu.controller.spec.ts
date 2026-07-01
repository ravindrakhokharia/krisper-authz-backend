import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

describe('MenuController', () => {
  let controller: MenuController;
  let service: jest.Mocked<MenuService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findHierarchical: jest.fn(),
      findUserModule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        { provide: MenuService, useValue: serviceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MenuController>(MenuController);
    service = module.get(MenuService) as jest.Mocked<MenuService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto: CreateMenuDto = { name: 'test', icon: 'test-icon' };
      const expectedResult = { data: { id: '1', ...dto }, message: 'Menu created successfully' };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const expectedResult = { data: [], message: 'Menus fetched successfully' };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should call service.findHierarchical if hierarchical is true', async () => {
      const expectedResult = { data: [], message: 'Hierarchical menus fetched successfully' };
      service.findHierarchical.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(true);

      expect(service.findHierarchical).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const id = '1';
      const expectedResult = { data: { id }, message: 'Menu fetched successfully' };
      service.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const id = '1';
      const dto: UpdateMenuDto = { name: 'updated' };
      const expectedResult = { data: { id, ...dto }, message: 'Menu updated successfully' };
      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call service.remove with id', async () => {
      const id = '1';
      const expectedResult = { data: { id }, message: 'Menu deleted successfully' };
      service.remove.mockResolvedValue(expectedResult as any);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findUserModule', () => {
    it('should call service.findUserModule with id', async () => {
      const id = '1';
      const expectedResult = { data: [], total: 0, message: 'User modules fetched successfully' };
      service.findUserModule.mockResolvedValue(expectedResult as any);

      const result = await controller.findUserModule(id);

      expect(service.findUserModule).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
