import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { TransformToNumber } from 'src/custom-decorator/custom-transform-decorator';

export class QueryPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @TransformToNumber()
  offset?: number = 0;

  @ApiPropertyOptional()
  @IsOptional()
  @TransformToNumber()
  limit?: number;
}
