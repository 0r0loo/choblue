import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @Length(2, 30)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
