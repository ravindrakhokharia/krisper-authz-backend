import { Test, TestingModule } from '@nestjs/testing';
import { PermissionListController } from './permission-list.controller';
import { PermissionListService } from './permission-list.service';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';

describe('PermissionListController', () => {
  let controller: PermissionListController;
  let service: jest.Mocked<PermissionListService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<PermissionListService>> = {
      permissionList: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionListController],
      providers: [{ provide: PermissionListService, useValue: serviceMock }],
    }).compile();

    controller = module.get<PermissionListController>(PermissionListController);
    service = module.get(
      PermissionListService,
    ) as jest.Mocked<PermissionListService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('permissionList', () => {
    it('delegates to service with query', async () => {
      const query: QueryPermissionListDto = {
        module: 'sales',
        limit: 10,
      } as any;
      const result = [
        { module: 'sales', role: 'admin', resource: 'orders', action: 'read' },
      ];
      service.permissionList.mockResolvedValue(result as any);

      const res = await controller.permissionList(query);
      expect(service.permissionList).toHaveBeenCalledWith(query);
      expect(res).toBe(result as any);
    });
  });
});
