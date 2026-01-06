import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const prismaMock: Partial<jest.Mocked<PrismaService>> = {
      role: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a role', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
      } as any;
      const created = { id: 'r1', ...dto } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.role.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: dto.name },
      });
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: dto.description },
      });
      expect(res).toBe(created);
    });

    it('should return existing role if name already exists', async () => {
      const dto: CreateRoleDto = {
        name: 'admin',
        description: 'Admin role',
      } as any;
      const existing = { id: 'r1', ...dto } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(existing);

      const res = await service.create(dto);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: dto.name },
      });
      expect(prisma.role.create).not.toHaveBeenCalled();
      expect(res).toBe(existing);
    });
  });

  describe('findAll', () => {
    it('returns all roles', async () => {
      const items = [{ id: 'r1' }, { id: 'r2' }] as any[];
      (prisma.role.findMany as jest.Mock).mockResolvedValue(items);
      const res = await service.findAll();
      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(res).toBe(items);
    });
  });

  describe('findOne', () => {
    it('returns role by id', async () => {
      const item = { id: 'r-123' } as any;
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(item);

      const res = await service.findOne('r-123');
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 'r-123' },
      });
      expect(res).toBe(item);
    });
  });

  describe('update', () => {
    it('updates a role', async () => {
      const dto: UpdateRoleDto = { description: 'New description' };
      const updated = { id: 'id-1', name: 'admin', ...dto } as any;
      (prisma.role.update as jest.Mock).mockResolvedValue(updated);

      const res = await service.update('id-1', dto);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'id-1' },
        data: dto,
      });
      expect(res).toBe(updated);
    });
  });

  describe('remove', () => {
    it('removes a role', async () => {
      const deleted = { id: 'id-2', name: 'user' } as any;
      (prisma.role.delete as jest.Mock).mockResolvedValue(deleted);

      const res = await service.remove('id-2');
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'id-2' },
      });
      expect(res).toBe(deleted);
    });
  });
});
