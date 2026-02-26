import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { LunchPostService } from './lunch-post.service';
import { CreateLunchPostDto } from './dto/create-lunch-post.dto';
import { UpdateLunchPostDto } from './dto/update-lunch-post.dto';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';

@Controller()
export class LunchPostController {
  constructor(
    @Inject(LunchPostService)
    private readonly lunchPostService: LunchPostService,
  ) {}

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/posts')
  async findByDate(
    @Param('workspaceId') _workspaceId: string,
    @Query('date') date: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.lunchPostService.findByDate(workspace.id, date);
  }

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/posts/calendar')
  async getCalendarData(
    @Param('workspaceId') _workspaceId: string,
    @Query('month') month: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.lunchPostService.getCalendarData(workspace.id, month);
  }

  @UseGuards(CookieGuard)
  @Post('workspaces/:workspaceId/posts')
  async create(
    @Param('workspaceId') _workspaceId: string,
    @Body() dto: CreateLunchPostDto,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.lunchPostService.create(dto, member.id, workspace.id);
  }

  @UseGuards(CookieGuard)
  @Get('posts/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.lunchPostService.findOne(id, workspace.id);
  }

  @UseGuards(CookieGuard)
  @Patch('posts/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLunchPostDto,
    @CurrentMember() member: Member,
  ) {
    return this.lunchPostService.update(id, dto, member.id);
  }

  @UseGuards(CookieGuard)
  @Delete('posts/:id')
  async remove(
    @Param('id') id: string,
    @CurrentMember() member: Member,
  ) {
    return this.lunchPostService.remove(id, member.id);
  }

  @UseGuards(CookieGuard)
  @Post('posts/:id/close')
  async close(
    @Param('id') id: string,
    @CurrentMember() member: Member,
  ) {
    return this.lunchPostService.close(id, member.id);
  }
}
