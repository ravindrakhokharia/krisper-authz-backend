import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleMenuDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  menuId: string;
}
