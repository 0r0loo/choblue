import {
  Controller,
  Get,
  Inject,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JoinWorkspaceDto } from './dto/join-workspace.dto';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '../auth/constants';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    @Inject(WorkspaceService)
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateWorkspaceDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.workspaceService.create(dto);

    res.cookie(AUTH_COOKIE_NAME, result.cookieToken, COOKIE_OPTIONS);

    return { workspace: result.workspace, member: result.member };
  }

  @Get('by-invite/:code')
  async findByInviteCode(
    @Param('code') code: string,
    @Req() req: Request,
  ) {
    const cookieToken: string | undefined = req.cookies?.[AUTH_COOKIE_NAME];
    return this.workspaceService.findByInviteCode(code, cookieToken);
  }

  @Post(':id/members')
  async join(
    @Param('id') id: string,
    @Body() dto: JoinWorkspaceDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken: string | undefined = req.cookies?.[AUTH_COOKIE_NAME];
    const result = await this.workspaceService.join(id, dto, cookieToken);

    if (!result.alreadyMember) {
      res.cookie(AUTH_COOKIE_NAME, result.cookieToken, COOKIE_OPTIONS);
    }

    return {
      memberId: result.member.id,
      workspaceSlug: result.workspaceSlug,
      alreadyMember: result.alreadyMember,
    };
  }

  @UseGuards(CookieGuard)
  @Get(':id')
  async findOne(
    @CurrentWorkspace() workspace: Workspace,
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.findOne(workspace.id, member);
  }

  @UseGuards(CookieGuard)
  @Patch(':id')
  async update(
    @Body() dto: UpdateWorkspaceDto,
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.update(member.workspaceId, dto, member);
  }

  @UseGuards(CookieGuard)
  @Post(':id/regenerate-invite')
  async regenerateInvite(
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.regenerateInviteCode(member.workspaceId, member);
  }

  @UseGuards(CookieGuard)
  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveWorkspace(
    @CurrentMember() member: Member,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.workspaceService.leaveWorkspace(member.workspaceId, member);
    res.clearCookie(AUTH_COOKIE_NAME);
  }

  @UseGuards(CookieGuard)
  @Get(':id/members')
  async findMembers(
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.findMembers(member.workspaceId);
  }
}
