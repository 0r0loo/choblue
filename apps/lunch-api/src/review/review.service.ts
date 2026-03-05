import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { LunchPost, LunchPostStatus } from '../entities/lunch-post.entity';
import { Participation } from '../entities/participation.entity';
import { MemberRole } from '../entities/member.entity';
import { RestaurantService } from '../restaurant/restaurant.service';
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
    @Inject(RestaurantService)
    private readonly restaurantService: RestaurantService,
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

    const { restaurant, menuItem } =
      await this.restaurantService.resolveRestaurantAndMenu(
        dto.restaurant,
        dto.menu,
        workspaceId,
      );

    const review = this.reviewRepository.create({
      lunchPostId: postId,
      memberId,
      restaurantId: restaurant.id,
      menuItemId: menuItem.id,
      tasteRating: dto.tasteRating,
      portionRating: dto.portionRating,
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
      relations: { member: true, restaurant: true, menuItem: true },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    reviewId: string,
    memberId: string,
    workspaceId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: { restaurant: true, menuItem: true },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.memberId !== memberId) {
      throw new ForbiddenException('본인의 리뷰만 수정할 수 있습니다.');
    }

    if (dto.tasteRating !== undefined) {
      review.tasteRating = dto.tasteRating;
    }

    if (dto.portionRating !== undefined) {
      review.portionRating = dto.portionRating;
    }

    if (dto.content !== undefined) {
      review.content = dto.content;
    }

    if (dto.restaurant !== undefined || dto.menu !== undefined) {
      const restaurantName = dto.restaurant ?? review.restaurant.name;
      const menuName = dto.menu ?? review.menuItem.name;
      const { restaurant, menuItem } =
        await this.restaurantService.resolveRestaurantAndMenu(
          restaurantName,
          menuName,
          workspaceId,
        );
      review.restaurantId = restaurant.id;
      review.menuItemId = menuItem.id;
      review.restaurant = restaurant;
      review.menuItem = menuItem;
    }

    return this.reviewRepository.save(review);
  }

  async remove(reviewId: string, memberId: string, memberRole?: MemberRole): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (memberRole !== MemberRole.ADMIN && review.memberId !== memberId) {
      throw new ForbiddenException('본인의 리뷰만 삭제할 수 있습니다.');
    }

    await this.reviewRepository.delete(reviewId);
  }

  async findByWorkspace(
    workspaceId: string,
    memberId: string,
    memberRole: MemberRole,
  ): Promise<Review[]> {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.member', 'member')
      .innerJoinAndSelect('review.restaurant', 'restaurant')
      .innerJoinAndSelect('review.menuItem', 'menuItem')
      .innerJoin('review.lunchPost', 'lunchPost')
      .where('lunchPost.workspaceId = :workspaceId', { workspaceId })
      .orderBy('review.createdAt', 'DESC');

    if (memberRole !== MemberRole.ADMIN) {
      qb.andWhere('review.memberId = :memberId', { memberId });
    }

    return qb.getMany();
  }

  async getMenuHistory(
    workspaceId: string,
    filters?: { dateFrom?: string; dateTo?: string; search?: string },
  ) {
    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.lunchPost', 'lunchPost')
      .innerJoin('review.member', 'member')
      .innerJoin('review.restaurant', 'restaurant')
      .innerJoin('review.menuItem', 'menuItem')
      .select([
        'review.id AS id',
        'restaurant.name AS restaurant',
        'menuItem.name AS menu',
        'review.tasteRating AS "tasteRating"',
        'review.portionRating AS "portionRating"',
        'lunchPost.date AS date',
        'member.nickname AS "memberNickname"',
      ])
      .where('lunchPost.workspaceId = :workspaceId', { workspaceId })
      .orderBy('lunchPost.date', 'DESC');

    if (filters?.dateFrom) {
      qb.andWhere('lunchPost.date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      qb.andWhere('lunchPost.date <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters?.search) {
      qb.andWhere(
        '(menuItem.name ILIKE :search OR restaurant.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return qb.getRawMany();
  }
}
