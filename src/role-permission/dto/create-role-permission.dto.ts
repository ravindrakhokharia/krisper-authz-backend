import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  permissionId: string;
}
