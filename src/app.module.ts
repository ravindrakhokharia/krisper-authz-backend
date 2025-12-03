import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { RoleModule } from './role/role.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ResourceModule } from './resource/resource.module';
import { PermissionModule } from './permission/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { UserRoleModule } from './user-role/user-role.module';
import { PermissionListModule } from './permission-list/permission-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RoleModule,
    ResourceModule,
    PermissionModule,
    RolePermissionModule,
    UserRoleModule,
    PermissionListModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
