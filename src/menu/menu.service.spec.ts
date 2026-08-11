import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { MenuService } from './menu.service';
import { PrismaService } from '../prisma/prisma.service';
import { HelperServices } from '../shared/helper/helper.services';

describe('MenuService', () => {
  let service: MenuService;
  let prisma: jest.Mocked<PrismaService>;
  let helper: jest.Mocked<HelperServices>;

  beforeEach(async () => {
    const prismaMock = {
      menu: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userRole: {
        findMany: jest.fn(),
      },
      roleMenu: {
        findMany: jest.fn(),
      },
    };

    const helperMock = {
      capitalize: jest.fn(
        (val: string) =>
          val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
      ),
    };

    const httpMock = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HelperServices, useValue: helperMock },
        { provide: HttpService, useValue: httpMock },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    helper = module.get(HelperServices) as jest.Mocked<HelperServices>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return existing menu if it already exists', async () => {
      const createMenuDto = { name: 'dashboard', icon: 'dashboard-icon' };
      const existingMenu = {
        id: '1',
        name: 'Dashboard',
        icon: 'dashboard-icon',
      };

      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(
        existingMenu as any,
      );

      const result = await service.create(createMenuDto);

      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { name: 'Dashboard' },
      });
      expect(result).toEqual(existingMenu);
      expect(prisma.menu.create).not.toHaveBeenCalled();
    });

    it('should create a new menu if it does not exist', async () => {
      const createMenuDto = { name: 'settings', icon: 'settings-icon' };
      const newMenu = { id: '2', name: 'Settings', icon: 'settings-icon' };

      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.menu.create as jest.Mock).mockResolvedValue(newMenu as any);

      const result = await service.create(createMenuDto);

      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { name: 'Settings' },
      });
      expect(prisma.menu.create).toHaveBeenCalledWith({
        data: { name: 'Settings', icon: 'settings-icon' },
      });
      expect(result).toEqual({
        data: newMenu,
        message: 'Menu created successfully',
      });
    });
  });

  describe('findAll', () => {
    it('should return all menus', async () => {
      const menus = [
        { id: '1', name: 'Menu 1' },
        { id: '2', name: 'Menu 2' },
      ];
      (prisma.menu.findMany as jest.Mock).mockResolvedValue(menus as any);

      const result = await service.findAll();

      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual({
        data: menus,
        message: 'Menus fetched successfully',
      });
    });
  });

  describe('findOne', () => {
    it('should return a single menu', async () => {
      const menu = { id: '1', name: 'Menu 1' };
      (prisma.menu.findUnique as jest.Mock).mockResolvedValue(menu as any);

      const result = await service.findOne('1');

      expect(prisma.menu.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        data: menu,
        message: 'Menu fetched successfully',
      });
    });
  });

  describe('update', () => {
    it('should update a menu', async () => {
      const updateMenuDto = { name: 'Updated Menu' };
      const updatedMenu = { id: '1', name: 'Updated Menu' };
      (prisma.menu.update as jest.Mock).mockResolvedValue(updatedMenu as any);

      const result = await service.update('1', updateMenuDto);

      expect(prisma.menu.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateMenuDto,
      });
      expect(result).toEqual({
        data: updatedMenu,
        message: 'Menu updated successfully',
      });
    });
  });

  describe('remove', () => {
    it('should delete a menu', async () => {
      const deletedMenu = { id: '1', name: 'Deleted Menu' };
      (prisma.menu.delete as jest.Mock).mockResolvedValue(deletedMenu as any);

      const result = await service.remove('1');

      expect(prisma.menu.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        data: deletedMenu,
        message: 'Menu deleted successfully',
      });
    });
  });

  describe('findHierarchical', () => {
    it('should build hierarchical menu and handle standalone, groups and remaining top-level items', async () => {
      const mockMenus = [
        {
          id: 'm-dash',
          name: 'Dashboard',
          icon: 'HomeIcon',
          createdAt: new Date(),
        },
        {
          id: 'm-sales-dash',
          name: 'Sales Dashboard',
          icon: 'SalesIcon',
          createdAt: new Date(),
        },
        {
          id: 'm-sales-orders',
          name: 'Sales Orders',
          icon: null,
          createdAt: new Date(),
        },
        {
          id: 'm-custom1',
          name: 'Custom One',
          icon: 'Star',
          createdAt: new Date(),
        },
        {
          id: 'm-custom2',
          name: 'Custom Two',
          icon: null,
          createdAt: new Date(),
        },
      ];

      (prisma.menu.findMany as jest.Mock).mockResolvedValue(mockMenus);

      const result = await service.findHierarchical();

      expect(prisma.menu.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' },
      });

      expect(result.message).toBe('Hierarchical menus fetched successfully');

      // Standalone (Dashboard)
      const dashboardItem = result.data.find((item) => item.id === 'm-dash');
      expect(dashboardItem).toBeDefined();
      expect(dashboardItem.type).toBe('standalone');
      expect(dashboardItem.icon).toBe('HomeIcon');

      // Group (Sales)
      const salesGroup = result.data.find((item) => item.id === 'sales');
      expect(salesGroup).toBeDefined();
      expect(salesGroup.type).toBe('group');
      expect(salesGroup.items).toHaveLength(2);
      expect(salesGroup.items[0].id).toBe('m-sales-dash');
      expect(salesGroup.items[1].id).toBe('m-sales-orders');

      // Remaining standalone with icon
      const customOne = result.data.find((item) => item.id === 'm-custom1');
      expect(customOne).toBeDefined();
      expect(customOne.type).toBe('standalone');
      expect(customOne.icon).toBe('Star');
      expect(customOne.path).toBe('custom-one');

      // Remaining standalone without icon falling back to 'Circle'
      const customTwo = result.data.find((item) => item.id === 'm-custom2');
      expect(customTwo).toBeDefined();
      expect(customTwo.type).toBe('standalone');
      expect(customTwo.icon).toBe('Circle');
      expect(customTwo.path).toBe('custom-two');
    });
  });

  describe('findUserModule', () => {
    it('should fetch user modules based on user roles', async () => {
      const userId = 'user-123';
      const mockUserRoles = [
        { userId, roleId: 'role-1' },
        { userId, roleId: 'role-2' },
      ];
      const mockRoleMenus = [
        {
          id: 'rm-1',
          roleId: 'role-1',
          menuId: 'm-1',
          menu: { id: 'm-1', name: 'Menu 1' },
        },
        {
          id: 'rm-2',
          roleId: 'role-2',
          menuId: 'm-2',
          menu: { id: 'm-2', name: 'Menu 2' },
        },
      ];

      (prisma.userRole.findMany as jest.Mock).mockResolvedValue(mockUserRoles);
      (prisma.roleMenu.findMany as jest.Mock).mockResolvedValue(mockRoleMenus);

      const result = await service.findUserModule(userId);

      expect(prisma.userRole.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prisma.roleMenu.findMany).toHaveBeenCalledWith({
        where: { roleId: { in: ['role-1', 'role-2'] } },
        include: { menu: true },
      });
      expect(result).toEqual({
        data: mockRoleMenus,
        total: 2,
        message: 'User modules fetched successfully',
      });
    });
  });
});
