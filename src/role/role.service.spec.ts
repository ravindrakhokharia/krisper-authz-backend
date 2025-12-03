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
      (prisma.role.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: dto.description },
      });
      expect(res).toBe(created);
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
    it('returns update message', async () => {
      const res = await service.update('id-1', {} as UpdateRoleDto);
      expect(res).toBe('This action updates a #id-1 role');
    });
  });

  describe('remove', () => {
    it('returns remove message', async () => {
      const res = await service.remove('id-2');
      expect(res).toBe('This action removes a #id-2 role');
    });
  });
});
