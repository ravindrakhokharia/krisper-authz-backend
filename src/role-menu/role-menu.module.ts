import { Module } from '@nestjs/common';
import { RoleMenuService } from './role-menu.service';
import { RoleMenuController } from './role-menu.controller';
import { ValidationService } from 'src/shared/services/validation.service';
import { HelperModule } from 'src/shared/helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [RoleMenuController],
  providers: [RoleMenuService, ValidationService],
})
export class RoleMenuModule {}
