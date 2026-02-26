import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateLunchPostDto {
  @IsString()
  @Length(1, 100)
  menu!: string;

  @IsOptional()
  @IsString()
  restaurant?: string;

  @IsString()
  date!: string;

  @IsString()
  time!: string;

  @IsInt()
  @Min(2)
  @Max(10)
  maxParticipants!: number;
}
