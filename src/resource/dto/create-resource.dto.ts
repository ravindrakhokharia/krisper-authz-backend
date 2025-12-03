import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Enter module name',
  })
  @IsString()
  @IsNotEmpty()
  module: string;

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
}
