import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryRolePermissionDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roleId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  permissionId: string;
}
