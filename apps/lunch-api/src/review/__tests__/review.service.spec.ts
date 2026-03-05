import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewService } from '../review.service';
import { Review } from '../../entities/review.entity';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Participation } from '../../entities/participation.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { RestaurantService } from '../../restaurant/restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuItem } from '../../entities/menu-item.entity';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let mockQueryBuilder: {
    innerJoinAndSelect: ReturnType<typeof vi.fn>;
    innerJoin: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    addSelect: ReturnType<typeof vi.fn>;
    where: ReturnType<typeof vi.fn>;
    andWhere: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    getMany: ReturnType<typeof vi.fn>;
    getRawMany: ReturnType<typeof vi.fn>;
  };
  let lunchPostRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let participationRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let restaurantService: {
    resolveRestaurantAndMenu: ReturnType<typeof vi.fn>;
  };

  const mockWorkspace: Workspace = {
    id: 'workspace-uuid-1234',
    name: 'Engineering Team',
    slug: 'engineering-team-a1b2',
    inviteCode: 'invite-code-uuid-v4',
    adminToken: 'admin-token-uuid-v4',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    members: [],
    lunchPosts: [],
    restaurants: [],
  };

  const mockMember: Member = {
    id: 'member-uuid-1234',
    nickname: 'bob',
    cookieToken: 'cookie-token-1234',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
    reviews: [],
  };

  const mockRestaurant: Restaurant = {
    id: 'restaurant-uuid-1234',
    name: '중화반점',
    workspaceId: 'workspace-uuid-1234',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    workspace: mockWorkspace,
    menuItems: [],
    reviews: [],
  };

  const mockMenuItem: MenuItem = {
    id: 'menu-item-uuid-1234',
    name: '짬뽕',
    restaurantId: 'restaurant-uuid-1234',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    restaurant: mockRestaurant,
    reviews: [],
  };

  function createMockLunchPost(overrides: Partial<LunchPost> = {}): LunchPost {
    return {
      id: 'post-uuid-1234',
      menu: '짬뽕',
      restaurant: '중화반점',
      date: '2026-03-01',
      time: '12:00',
      maxParticipants: 4,
      status: LunchPostStatus.CLOSED,
      isDeleted: false,
      workspaceId: 'workspace-uuid-1234',
      authorId: 'author-member-uuid',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      workspace: mockWorkspace,
      author: mockMember,
      participations: [],
      reviews: [],
      ...overrides,
    };
  }

  function createMockReview(overrides: Partial<Review> = {}): Review {
    return {
      id: 'review-uuid-1234',
      lunchPostId: 'post-uuid-1234',
      memberId: 'member-uuid-1234',
      restaurantId: 'restaurant-uuid-1234',
      menuItemId: 'menu-item-uuid-1234',
      tasteRating: 4,
      portionRating: 4,
      content: '맛있었어요',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      lunchPost: createMockLunchPost(),
      member: mockMember,
      restaurant: mockRestaurant,
      menuItem: mockMenuItem,
      ...overrides,
    };
  }

  function createMockParticipation(overrides: Partial<Participation> = {}): Participation {
    return {
      id: 'participation-uuid-1234',
      lunchPostId: 'post-uuid-1234',
      memberId: 'member-uuid-1234',
      createdAt: new Date('2025-01-01'),
      lunchPost: createMockLunchPost(),
      member: mockMember,
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockQueryBuilder = {
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn(),
      getRawMany: vi.fn(),
    };
    reviewRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      delete: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
    };
    lunchPostRepository = {
      findOne: vi.fn(),
    };
    participationRepository = {
      findOne: vi.fn(),
    };
    restaurantService = {
      resolveRestaurantAndMenu: vi.fn().mockResolvedValue({
        restaurant: mockRestaurant,
        menuItem: mockMenuItem,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(Review),
          useValue: reviewRepository,
        },
        {
          provide: getRepositoryToken(LunchPost),
          useValue: lunchPostRepository,
        },
        {
          provide: getRepositoryToken(Participation),
          useValue: participationRepository,
        },
        {
          provide: RestaurantService,
          useValue: restaurantService,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto = { tasteRating: 4, portionRating: 4, restaurant: '중화반점', menu: '짬뽕', content: '맛있었어요' };

    it('should create a review when conditions are valid', async () => {
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const mockReview = createMockReview();

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(null);
      reviewRepository.create.mockReturnValue(mockReview);
      reviewRepository.save.mockResolvedValue(mockReview);

      const result = await service.create(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        dto,
      );

      expect(result).toBeDefined();
      expect(result.tasteRating).toBe(4);
      expect(result.portionRating).toBe(4);
      expect(result.content).toBe('맛있었어요');
      expect(restaurantService.resolveRestaurantAndMenu).toHaveBeenCalledWith(
        '중화반점',
        '짬뽕',
        mockWorkspace.id,
      );
      expect(reviewRepository.create).toHaveBeenCalledWith({
        lunchPostId: 'post-uuid-1234',
        memberId: mockMember.id,
        restaurantId: mockRestaurant.id,
        menuItemId: mockMenuItem.id,
        tasteRating: 4,
        portionRating: 4,
        content: '맛있었어요',
      });
      expect(reviewRepository.save).toHaveBeenCalledWith(mockReview);
    });

    it('should set content to null when content is not provided', async () => {
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const mockReview = createMockReview({ content: null });

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(null);
      reviewRepository.create.mockReturnValue(mockReview);
      reviewRepository.save.mockResolvedValue(mockReview);

      await service.create(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        { tasteRating: 5, portionRating: 5, restaurant: '중화반점', menu: '짬뽕' },
      );

      expect(reviewRepository.create).toHaveBeenCalledWith({
        lunchPostId: 'post-uuid-1234',
        memberId: mockMember.id,
        restaurantId: mockRestaurant.id,
        menuItemId: mockMenuItem.id,
        tasteRating: 5,
        portionRating: 5,
        content: null,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      lunchPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create('non-existent-id', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when post belongs to a different workspace', async () => {
      const otherWorkspacePost = createMockLunchPost({
        workspaceId: 'other-workspace-uuid',
      });
      lunchPostRepository.findOne.mockResolvedValue(otherWorkspacePost);

      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post is not CLOSED', async () => {
      const openPost = createMockLunchPost({ status: LunchPostStatus.OPEN });
      lunchPostRepository.findOne.mockResolvedValue(openPost);

      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when member is not a participant', async () => {
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when review already exists', async () => {
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const existingReview = createMockReview();

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(existingReview);

      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // findByPost
  // ─────────────────────────────────────────────
  describe('findByPost', () => {
    it('should return reviews for a post', async () => {
      const mockPost = createMockLunchPost();
      const mockReviews = [
        createMockReview({ id: 'review-1' }),
        createMockReview({ id: 'review-2', tasteRating: 3, content: '보통이에요' }),
      ];

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      reviewRepository.find.mockResolvedValue(mockReviews);

      const result = await service.findByPost('post-uuid-1234', mockWorkspace.id);

      expect(result).toHaveLength(2);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { lunchPostId: 'post-uuid-1234' },
        relations: { member: true, restaurant: true, menuItem: true },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no reviews exist', async () => {
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      reviewRepository.find.mockResolvedValue([]);

      const result = await service.findByPost('post-uuid-1234', mockWorkspace.id);

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      lunchPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByPost('non-existent-id', mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      await expect(
        service.findByPost('post-uuid-1234', mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when post belongs to a different workspace', async () => {
      const otherWorkspacePost = createMockLunchPost({
        workspaceId: 'other-workspace-uuid',
      });
      lunchPostRepository.findOne.mockResolvedValue(otherWorkspacePost);

      await expect(
        service.findByPost('post-uuid-1234', mockWorkspace.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('should update tasteRating when provided', async () => {
      const mockReview = createMockReview();
      const updatedReview = createMockReview({ tasteRating: 5 });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue(updatedReview);

      const result = await service.update('review-uuid-1234', mockMember.id, mockWorkspace.id, {
        tasteRating: 5,
      });

      expect(result.tasteRating).toBe(5);
      expect(reviewRepository.save).toHaveBeenCalled();
    });

    it('should update content when provided', async () => {
      const mockReview = createMockReview();
      const updatedReview = createMockReview({ content: '변경된 리뷰' });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue(updatedReview);

      const result = await service.update('review-uuid-1234', mockMember.id, mockWorkspace.id, {
        content: '변경된 리뷰',
      });

      expect(result.content).toBe('변경된 리뷰');
    });

    it('should resolve restaurant and menu when restaurant name changes', async () => {
      const mockReview = createMockReview();
      const newRestaurant = { ...mockRestaurant, id: 'new-restaurant-uuid', name: '새식당' };
      const newMenuItem = { ...mockMenuItem, id: 'new-menu-item-uuid', name: '짬뽕' };
      restaurantService.resolveRestaurantAndMenu.mockResolvedValue({
        restaurant: newRestaurant,
        menuItem: newMenuItem,
      });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue({
        ...mockReview,
        restaurantId: newRestaurant.id,
        menuItemId: newMenuItem.id,
        restaurant: newRestaurant,
        menuItem: newMenuItem,
      });

      const result = await service.update('review-uuid-1234', mockMember.id, mockWorkspace.id, {
        restaurant: '새식당',
      });

      expect(restaurantService.resolveRestaurantAndMenu).toHaveBeenCalledWith(
        '새식당',
        '짬뽕',
        mockWorkspace.id,
      );
      expect(result.restaurantId).toBe(newRestaurant.id);
    });

    it('should throw NotFoundException when review does not exist', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', mockMember.id, mockWorkspace.id, { tasteRating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when member is not the author', async () => {
      const mockReview = createMockReview({ memberId: 'other-member-uuid' });
      reviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(
        service.update('review-uuid-1234', mockMember.id, mockWorkspace.id, { tasteRating: 5 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('should delete the review', async () => {
      const mockReview = createMockReview();
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('review-uuid-1234', mockMember.id);

      expect(reviewRepository.delete).toHaveBeenCalledWith('review-uuid-1234');
    });

    it('should throw NotFoundException when review does not exist', async () => {
      reviewRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockMember.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when member is not the author', async () => {
      const mockReview = createMockReview({ memberId: 'other-member-uuid' });
      reviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(
        service.remove('review-uuid-1234', mockMember.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to delete any review', async () => {
      const otherReview = createMockReview({ memberId: 'other-member-uuid' });
      reviewRepository.findOne.mockResolvedValue(otherReview);
      reviewRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('review-uuid-1234', mockMember.id, MemberRole.ADMIN);

      expect(reviewRepository.delete).toHaveBeenCalledWith('review-uuid-1234');
    });
  });

  // ─────────────────────────────────────────────
  // findByWorkspace
  // ─────────────────────────────────────────────
  describe('findByWorkspace', () => {
    it('should return reviews for a workspace (admin sees all)', async () => {
      const mockReviews = [createMockReview()];
      mockQueryBuilder.getMany.mockResolvedValue(mockReviews);

      const result = await service.findByWorkspace(
        mockWorkspace.id,
        mockMember.id,
        MemberRole.ADMIN,
      );

      expect(result).toHaveLength(1);
      expect(reviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('review.member', 'member');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('review.restaurant', 'restaurant');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('review.menuItem', 'menuItem');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('review.lunchPost', 'lunchPost');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'lunchPost.workspaceId = :workspaceId',
        { workspaceId: mockWorkspace.id },
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should filter by memberId for non-admin members', async () => {
      const mockReviews = [createMockReview()];
      mockQueryBuilder.getMany.mockResolvedValue(mockReviews);

      const result = await service.findByWorkspace(
        mockWorkspace.id,
        mockMember.id,
        MemberRole.MEMBER,
      );

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'review.memberId = :memberId',
        { memberId: mockMember.id },
      );
    });
  });

  // ─────────────────────────────────────────────
  // getMenuHistory
  // ─────────────────────────────────────────────
  describe('getMenuHistory', () => {
    it('should return menu history for a workspace', async () => {
      const rawResults = [
        { id: 'review-1', restaurant: '중화반점', menu: '짬뽕', tasteRating: 4, portionRating: 4, date: '2026-03-01', memberNickname: 'bob' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(rawResults);

      const result = await service.getMenuHistory(mockWorkspace.id);

      expect(result).toHaveLength(1);
      expect(reviewRepository.createQueryBuilder).toHaveBeenCalledWith('review');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });

    it('should apply date filters when provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMenuHistory(mockWorkspace.id, {
        dateFrom: '2026-01-01',
        dateTo: '2026-03-31',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lunchPost.date >= :dateFrom',
        { dateFrom: '2026-01-01' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lunchPost.date <= :dateTo',
        { dateTo: '2026-03-31' },
      );
    });

    it('should apply search filter when provided', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMenuHistory(mockWorkspace.id, { search: '짬뽕' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(menuItem.name ILIKE :search OR restaurant.name ILIKE :search)',
        { search: '%짬뽕%' },
      );
    });
  });
});
