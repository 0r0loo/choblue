import { IsString, IsNotEmpty, Length } from 'class-validator';

export class JoinWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}
