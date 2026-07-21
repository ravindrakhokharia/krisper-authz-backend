import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    description: 'Menu IDs associated with the role',
  })
  @IsArray()
  @IsOptional()
  menuIds?: string[];

  @ApiPropertyOptional({
    description: 'User IDs associated with the role',
  })
  @IsArray()
  @IsOptional()
  userIds?: string[];
}
