import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../review.controller';
import { ReviewService } from '../review.service';
import { Review } from '../../entities/review.entity';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { CookieGuard } from '../../auth/cookie.guard';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    findByWorkspace: ReturnType<typeof vi.fn>;
    getMenuHistory: ReturnType<typeof vi.fn>;
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
      lunchPost: {
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
      },
      member: mockMember,
      restaurant: mockRestaurant,
      menuItem: mockMenuItem,
      ...overrides,
    };
  }

  beforeEach(async () => {
    reviewService = {
      create: vi.fn(),
      findByPost: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      findByWorkspace: vi.fn(),
      getMenuHistory: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: reviewService,
        },
      ],
    })
      .overrideGuard(CookieGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // POST /posts/:id/reviews
  // ─────────────────────────────────────────────
  describe('POST /posts/:id/reviews', () => {
    it('should call reviewService.create and return mapped review', async () => {
      const dto = { tasteRating: 4, portionRating: 4, restaurant: '중화반점', menu: '짬뽕', content: '맛있었어요' };
      const mockReview = createMockReview();
      reviewService.create.mockResolvedValue(mockReview);

      const result = await controller.create('post-uuid-1234', mockMember, mockWorkspace, dto);

      expect(reviewService.create).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        dto,
      );
      expect(result).toBeDefined();
      expect(result.tasteRating).toBe(4);
      expect(result.content).toBe('맛있었어요');
      expect(result.restaurant).toBe('중화반점');
      expect(result.menu).toBe('짬뽕');
      expect(result.restaurantId).toBe('restaurant-uuid-1234');
      expect(result.menuItemId).toBe('menu-item-uuid-1234');
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.create,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts/:id/reviews
  // ─────────────────────────────────────────────
  describe('GET /posts/:id/reviews', () => {
    it('should call reviewService.findByPost and return mapped reviews', async () => {
      const mockReviews = [
        createMockReview({ id: 'review-1' }),
        createMockReview({ id: 'review-2', tasteRating: 3 }),
      ];
      reviewService.findByPost.mockResolvedValue(mockReviews);

      const result = await controller.findByPost('post-uuid-1234', mockWorkspace);

      expect(reviewService.findByPost).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockWorkspace.id,
      );
      expect(result).toHaveLength(2);
      expect(result[0].restaurant).toBe('중화반점');
      expect(result[0].menu).toBe('짬뽕');
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.findByPost,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /reviews/:id
  // ─────────────────────────────────────────────
  describe('PATCH /reviews/:id', () => {
    it('should call reviewService.update with correct arguments', async () => {
      const dto = { tasteRating: 5, content: '수정된 리뷰' };
      const mockReview = createMockReview({ tasteRating: 5, content: '수정된 리뷰' });
      reviewService.update.mockResolvedValue(mockReview);

      const result = await controller.update('review-uuid-1234', mockMember, mockWorkspace, dto);

      expect(reviewService.update).toHaveBeenCalledWith(
        'review-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        dto,
      );
      expect(result.tasteRating).toBe(5);
      expect(result.restaurant).toBe('중화반점');
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.update,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /reviews/:id
  // ─────────────────────────────────────────────
  describe('DELETE /reviews/:id', () => {
    it('should call reviewService.remove with correct arguments', async () => {
      reviewService.remove.mockResolvedValue(undefined);

      await controller.remove('review-uuid-1234', mockMember);

      expect(reviewService.remove).toHaveBeenCalledWith(
        'review-uuid-1234',
        mockMember.id,
        mockMember.role,
      );
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.remove,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /workspaces/:id/reviews
  // ─────────────────────────────────────────────
  describe('GET /workspaces/:workspaceId/reviews', () => {
    it('should call reviewService.findByWorkspace and return mapped reviews', async () => {
      const mockReviews = [createMockReview()];
      reviewService.findByWorkspace.mockResolvedValue(mockReviews);

      const result = await controller.findByWorkspace('slug-ignored', mockMember, mockWorkspace);

      expect(reviewService.findByWorkspace).toHaveBeenCalledWith(
        mockWorkspace.id,
        mockMember.id,
        mockMember.role,
      );
      expect(result).toHaveLength(1);
      expect(result[0].restaurant).toBe('중화반점');
      expect(result[0].menu).toBe('짬뽕');
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.findByWorkspace,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /workspaces/:id/menu-history
  // ─────────────────────────────────────────────
  describe('GET /workspaces/:workspaceId/menu-history', () => {
    it('should call reviewService.getMenuHistory with workspace.id from decorator', async () => {
      const rawResults = [
        { id: 'review-1', restaurant: '중화반점', menu: '짬뽕', tasteRating: 4, portionRating: 4, date: '2026-03-01', memberNickname: 'bob' },
      ];
      reviewService.getMenuHistory.mockResolvedValue(rawResults);

      const result = await controller.getMenuHistory(
        'slug-ignored',
        mockWorkspace,
        '2026-01-01',
        '2026-03-31',
        '짬뽕',
      );

      expect(reviewService.getMenuHistory).toHaveBeenCalledWith(
        mockWorkspace.id,
        { dateFrom: '2026-01-01', dateTo: '2026-03-31', search: '짬뽕' },
      );
      expect(result).toHaveLength(1);
    });

    it('should call reviewService.getMenuHistory without filters when not provided', async () => {
      reviewService.getMenuHistory.mockResolvedValue([]);

      await controller.getMenuHistory('slug-ignored', mockWorkspace);

      expect(reviewService.getMenuHistory).toHaveBeenCalledWith(
        mockWorkspace.id,
        { dateFrom: undefined, dateTo: undefined, search: undefined },
      );
    });

    it('should have CookieGuard applied', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.getMenuHistory,
      );

      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
