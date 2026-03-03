import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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
