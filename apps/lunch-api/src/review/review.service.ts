import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { LunchPost, LunchPostStatus } from '../entities/lunch-post.entity';
import { Participation } from '../entities/participation.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(LunchPost)
    private readonly lunchPostRepository: Repository<LunchPost>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  async create(
    postId: string,
    memberId: string,
    workspaceId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const post = await this.lunchPostRepository.findOne({
      where: { id: postId },
    });

    if (!post || post.isDeleted) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }

    if (post.workspaceId !== workspaceId) {
      throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
    }

    if (post.status !== LunchPostStatus.CLOSED) {
      throw new BadRequestException('마감된 모집글에만 리뷰를 작성할 수 있습니다.');
    }

    const participation = await this.participationRepository.findOne({
      where: { lunchPostId: postId, memberId },
    });

    if (!participation) {
      throw new ForbiddenException('참가자만 리뷰를 작성할 수 있습니다.');
    }

    const existing = await this.reviewRepository.findOne({
      where: { lunchPostId: postId, memberId },
    });

    if (existing) {
      throw new BadRequestException('이미 리뷰를 작성했습니다.');
    }

    const review = this.reviewRepository.create({
      lunchPostId: postId,
      memberId,
      rating: dto.rating,
      content: dto.content ?? null,
    });

    return this.reviewRepository.save(review);
  }

  async findByPost(postId: string, workspaceId: string): Promise<Review[]> {
    const post = await this.lunchPostRepository.findOne({
      where: { id: postId },
    });

    if (!post || post.isDeleted) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }

    if (post.workspaceId !== workspaceId) {
      throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
    }

    return this.reviewRepository.find({
      where: { lunchPostId: postId },
      relations: { member: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    reviewId: string,
    memberId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.memberId !== memberId) {
      throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.content !== undefined) {
      review.content = dto.content;
    }

    return this.reviewRepository.save(review);
  }

  async remove(reviewId: string, memberId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.memberId !== memberId) {
      throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');
    }

    await this.reviewRepository.delete(reviewId);
  }
}
