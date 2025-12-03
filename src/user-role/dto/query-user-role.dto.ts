import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryUserRoleDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roleId: string;
}
