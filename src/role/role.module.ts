import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { HelperModule } from 'src/shared/helper/helper.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HelperModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
