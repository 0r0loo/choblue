import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  tasteRating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  portionRating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  restaurant?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  menu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  content?: string;
}
