import { IsString, IsNotEmpty } from 'class-validator';

export class JoinWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}
