import { Module } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionController } from './role-permission.controller';
import { ValidationService } from 'src/shared/services/validation.service';
import { HelperModule } from 'src/shared/helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [RolePermissionController],
  providers: [RolePermissionService, ValidationService],
})
export class RolePermissionModule {}
