import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryPermissionDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  actionId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resourceId: string;
}
