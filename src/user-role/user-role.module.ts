import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRoleController } from './user-role.controller';
import { ValidationService } from 'src/shared/services/validation.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [UserRoleController],
  providers: [UserRoleService, ValidationService],
})
export class UserRoleModule {}
