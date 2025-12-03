import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { ValidationService } from 'src/shared/services/validation.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, ValidationService],
})
export class PermissionModule {}
