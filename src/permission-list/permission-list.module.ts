import { Module } from '@nestjs/common';
import { PermissionListService } from './permission-list.service';
import { PermissionListController } from './permission-list.controller';

@Module({
  controllers: [PermissionListController],
  providers: [PermissionListService],
})
export class PermissionListModule {}
