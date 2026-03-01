import {
  Controller,
  Get,
  Inject,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
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
  async findByInviteCode(@Param('code') code: string) {
    return this.workspaceService.findByInviteCode(code);
  }

  @Post(':id/members')
  async join(
    @Param('id') id: string,
    @Body() dto: JoinWorkspaceDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.workspaceService.join(id, dto);

    res.cookie(AUTH_COOKIE_NAME, result.cookieToken, COOKIE_OPTIONS);

    return {
      memberId: result.member.id,
      workspaceSlug: result.workspaceSlug,
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
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentMember() member: Member,
  ) {
    if (id !== member.workspaceId) {
      throw new ForbiddenException(
        'Cannot update a workspace you do not belong to',
      );
    }
    return this.workspaceService.update(id, dto, member);
  }

  @UseGuards(CookieGuard)
  @Post(':id/regenerate-invite')
  async regenerateInvite(
    @Param('id') id: string,
    @CurrentMember() member: Member,
  ) {
    if (id !== member.workspaceId) {
      throw new ForbiddenException(
        'Cannot regenerate invite for a workspace you do not belong to',
      );
    }
    return this.workspaceService.regenerateInviteCode(id, member);
  }

  @UseGuards(CookieGuard)
  @Delete(':id/members/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveWorkspace(
    @Param('id') id: string,
    @CurrentMember() member: Member,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (id !== member.workspaceId) {
      throw new ForbiddenException(
        'Cannot leave a workspace you do not belong to',
      );
    }
    await this.workspaceService.leaveWorkspace(id, member);
    res.clearCookie(AUTH_COOKIE_NAME);
  }

  @UseGuards(CookieGuard)
  @Get(':id/members')
  async findMembers(
    @Param('id') id: string,
    @CurrentMember() member: Member,
  ) {
    if (id !== member.workspaceId) {
      throw new ForbiddenException(
        'Cannot view members of a workspace you do not belong to',
      );
    }
    return this.workspaceService.findMembers(id);
  }
}
