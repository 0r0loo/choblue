import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  nickname!: string;
}
