import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller()
export class ReviewController {
  constructor(
    @Inject(ReviewService)
    private readonly reviewService: ReviewService,
  ) {}

  @UseGuards(CookieGuard)
  @Post('posts/:id/reviews')
  async create(
    @Param('id') postId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(postId, member.id, workspace.id, dto);
  }

  @UseGuards(CookieGuard)
  @Get('posts/:id/reviews')
  async findByPost(
    @Param('id') postId: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.reviewService.findByPost(postId, workspace.id);
  }

  @UseGuards(CookieGuard)
  @Patch('reviews/:id')
  async update(
    @Param('id') reviewId: string,
    @CurrentMember() member: Member,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(reviewId, member.id, dto);
  }

  @UseGuards(CookieGuard)
  @Delete('reviews/:id')
  async remove(
    @Param('id') reviewId: string,
    @CurrentMember() member: Member,
  ) {
    return this.reviewService.remove(reviewId, member.id);
  }
}
