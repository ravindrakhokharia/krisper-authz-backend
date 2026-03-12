import { Test, TestingModule } from '@nestjs/testing';
import { RoleMenuService } from './role-menu.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/shared/services/validation.service';
import { QueryRoleMenuDto } from './dto/query-role-menu.dto';
import { CreateRoleMenuDto } from './dto/create-role-menu.dto';
import { UpdateRoleMenuDto } from './dto/update-role-menu.dto';

describe('RoleMenuService', () => {
  let service: RoleMenuService;
  let prisma: jest.Mocked<PrismaService>;
  let validationService: jest.Mocked<ValidationService>;

  beforeEach(async () => {
    const prismaMock = {
      roleMenu: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const validationMock = {
      validateReferences: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleMenuService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ValidationService, useValue: validationMock },
      ],
    }).compile();

    service = module.get<RoleMenuService>(RoleMenuService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    validationService = module.get(ValidationService) as jest.Mocked<ValidationService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role menu after validation', async () => {
      const dto: CreateRoleMenuDto = { roleId: 'role1', menuId: 'menu1' };
      const createdRoleMenu = { id: '1', ...dto };
      
      validationService.validateReferences.mockResolvedValue(undefined);
      prisma.roleMenu.create.mockResolvedValue(createdRoleMenu as any);

      const result = await service.create(dto);

      expect(validationService.validateReferences).toHaveBeenCalledWith({
        roleId: 'role1',
        menuId: 'menu1',
      });
      expect(prisma.roleMenu.create).toHaveBeenCalledWith({
        data: dto,
        include: { role: true, menu: true },
      });
      expect(result).toEqual({
        data: createdRoleMenu,
        message: 'Role menu created successfully',
      });
    });
  });

  describe('findAll', () => {
    it('should return role menus based on query including roleId', async () => {
      const query: QueryRoleMenuDto = { roleId: 'role1', limit: 10, offset: 0 } as any;
      const roleMenus = [{ id: '1', roleId: 'role1', menuId: 'menu1' }];
      prisma.roleMenu.findMany.mockResolvedValue(roleMenus as any);
      prisma.roleMenu.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(prisma.roleMenu.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role1' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: roleMenus,
        pagination: { offset: 0, limit: 10, total: 1 },
      });
    });

    it('should return role menus based on query including menuId', async () => {
      const query: QueryRoleMenuDto = { menuId: 'menu1', limit: 10, offset: 0 } as any;
      const roleMenus = [{ id: '1', roleId: 'role1', menuId: 'menu1' }];
      prisma.roleMenu.findMany.mockResolvedValue(roleMenus as any);
      prisma.roleMenu.count.mockResolvedValue(1);

      const result = await service.findAll(query);

      expect(prisma.roleMenu.findMany).toHaveBeenCalledWith({
        where: { menuId: 'menu1' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: roleMenus,
        pagination: { offset: 0, limit: 10, total: 1 },
      });
    });

    it('should return role menus with empty whereClause if no ids provided', async () => {
      const query: QueryRoleMenuDto = { limit: 10, offset: 0 } as any;
      const roleMenus = [];
      prisma.roleMenu.findMany.mockResolvedValue(roleMenus as any);
      prisma.roleMenu.count.mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(prisma.roleMenu.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: roleMenus,
        pagination: { offset: 0, limit: 10, total: 0 },
      });
    });
  });

  describe('findOne', () => {
    it('should return a role menu by id', async () => {
      const id = '1';
      const roleMenu = { id, roleId: 'role1', menuId: 'menu1' };
      prisma.roleMenu.findUnique.mockResolvedValue(roleMenu as any);

      const result = await service.findOne(id);

      expect(prisma.roleMenu.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        data: roleMenu,
        message: 'Role menu fetched successfully',
      });
    });
  });

  describe('update', () => {
    it('should update a role menu', async () => {
      const id = '1';
      const dto: UpdateRoleMenuDto = { menuId: 'menu2' };
      const updatedRoleMenu = { id, roleId: 'role1', menuId: 'menu2' };
      prisma.roleMenu.update.mockResolvedValue(updatedRoleMenu as any);

      const result = await service.update(id, dto);

      expect(prisma.roleMenu.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual({
        data: updatedRoleMenu,
        message: 'Role menu updated successfully',
      });
    });
  });

  describe('remove', () => {
    it('should delete a role menu', async () => {
      const id = '1';
      const deletedRoleMenu = { id, roleId: 'role1', menuId: 'menu1' };
      prisma.roleMenu.delete.mockResolvedValue(deletedRoleMenu as any);

      const result = await service.remove(id);

      expect(prisma.roleMenu.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual({
        data: deletedRoleMenu,
        message: 'Role menu deleted successfully',
      });
    });
  });
});
