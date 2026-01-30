import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { HelperModule } from 'src/shared/helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
