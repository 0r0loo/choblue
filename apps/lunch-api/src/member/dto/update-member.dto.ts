import { IsString, Length } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @Length(2, 10)
  nickname!: string;
}
