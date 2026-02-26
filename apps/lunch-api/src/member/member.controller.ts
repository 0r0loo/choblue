import {
  Controller,
  Patch,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { Member } from '../entities/member.entity';

@Controller('members')
export class MemberController {
  constructor(
    @Inject(MemberService)
    private readonly memberService: MemberService,
  ) {}

  @UseGuards(CookieGuard)
  @Patch('me')
  async updateNickname(
    @Body() dto: UpdateMemberDto,
    @CurrentMember() member: Member,
  ) {
    return this.memberService.updateNickname(member.id, dto.nickname);
  }
}
