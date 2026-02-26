import {
  Controller,
  Get,
  Inject,
  Post,
  Patch,
  Param,
  Body,
  Res,
  UseGuards,
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

    return { member: result.member };
  }

  @UseGuards(CookieGuard)
  @Get(':id')
  async findOne(@CurrentWorkspace() workspace: Workspace) {
    return this.workspaceService.findOne(workspace.id);
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
