import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateLunchPostDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  menu?: string;

  @IsOptional()
  @IsString()
  restaurant?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  maxParticipants?: number;
}
