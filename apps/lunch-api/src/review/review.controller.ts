import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentMember } from '../auth/current-member.decorator';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { Member } from '../entities/member.entity';
import { Workspace } from '../entities/workspace.entity';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller()
export class ReviewController {
  constructor(
    @Inject(ReviewService)
    private readonly reviewService: ReviewService,
  ) {}

  private mapReview(review: Review) {
    return {
      ...review,
      restaurant: review.restaurant?.name ?? '',
      menu: review.menuItem?.name ?? '',
      restaurantId: review.restaurantId,
      menuItemId: review.menuItemId,
    };
  }

  @UseGuards(CookieGuard)
  @Post('posts/:id/reviews')
  async create(
    @Param('id') postId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewService.create(postId, member.id, workspace.id, dto);
    return this.mapReview(review);
  }

  @UseGuards(CookieGuard)
  @Get('posts/:id/reviews')
  async findByPost(
    @Param('id') postId: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    const reviews = await this.reviewService.findByPost(postId, workspace.id);
    return reviews.map((r) => this.mapReview(r));
  }

  @UseGuards(CookieGuard)
  @Patch('reviews/:id')
  async update(
    @Param('id') reviewId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
    @Body() dto: UpdateReviewDto,
  ) {
    const review = await this.reviewService.update(reviewId, member.id, workspace.id, dto);
    return this.mapReview(review);
  }

  @UseGuards(CookieGuard)
  @Delete('reviews/:id')
  async remove(
    @Param('id') reviewId: string,
    @CurrentMember() member: Member,
  ) {
    return this.reviewService.remove(reviewId, member.id, member.role);
  }

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/reviews')
  async findByWorkspace(
    @Param('workspaceId') _workspaceId: string,
    @CurrentMember() member: Member,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    const reviews = await this.reviewService.findByWorkspace(workspace.id, member.id, member.role);
    return reviews.map((r) => this.mapReview(r));
  }

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/menu-history')
  async getMenuHistory(
    @Param('workspaceId') _workspaceId: string,
    @CurrentWorkspace() workspace: Workspace,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reviewService.getMenuHistory(workspace.id, {
      dateFrom,
      dateTo,
      search,
    });
  }
}
