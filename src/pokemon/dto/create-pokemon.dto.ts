import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  no: number;
}
