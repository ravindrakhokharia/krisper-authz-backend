import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  actionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resourceId: string;
}
