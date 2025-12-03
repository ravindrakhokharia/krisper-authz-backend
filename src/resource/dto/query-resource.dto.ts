import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from 'src/shared/dto/query-pagination.dto';

export class QueryResourceDto extends QueryPaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  module: string;
}
