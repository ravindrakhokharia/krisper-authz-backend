import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({
    description: 'Name of the menu',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Icon of the menu',
  })
  @IsString()
  @IsOptional()
  icon: string;
}
