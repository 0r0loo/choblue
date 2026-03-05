import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  tasteRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  portionRating!: number;

  @IsString()
  @MaxLength(100)
  restaurant!: string;

  @IsString()
  @MaxLength(100)
  menu!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  content?: string;
}
