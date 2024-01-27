import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  offset?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  limit?: number;
}
