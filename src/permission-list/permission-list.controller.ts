import { Controller, Get, Query } from '@nestjs/common';
import { PermissionListService } from './permission-list.service';
import { QueryPermissionListDto } from './dto/query-permission-list.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Permission List')
@Controller('permission-list')
export class PermissionListController {
  constructor(private readonly permissionListService: PermissionListService) {}

  @Get()
  permissionList(@Query() query: QueryPermissionListDto) {
    return this.permissionListService.permissionList(query);
  }
}
