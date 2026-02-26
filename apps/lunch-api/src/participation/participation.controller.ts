import {
  Controller,
  Post,
  Delete,
  Param,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';

@Controller()
export class ParticipationController {
  constructor(
    @Inject(ParticipationService)
    private readonly participationService: ParticipationService,
  ) {}

  @UseGuards(CookieGuard)
  @Post('posts/:id/participate')
  async participate(
    @Param('id') postId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.participationService.participate(
      postId,
      member.id,
      workspace.id,
    );
  }

  @UseGuards(CookieGuard)
  @Delete('posts/:id/participate')
  async cancelParticipation(
    @Param('id') postId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.participationService.cancelParticipation(
      postId,
      member.id,
      workspace.id,
    );
  }
}
