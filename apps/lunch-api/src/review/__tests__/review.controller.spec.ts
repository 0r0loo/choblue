import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../review.controller';
import { ReviewService } from '../review.service';
import { Review } from '../../entities/review.entity';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CookieGuard } from '../../auth/cookie.guard';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: {
    create: ReturnType<typeof vi.fn>;
    findByPost: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
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

  function createMockReview(overrides: Partial<Review> = {}): Review {
    return {
      id: 'review-uuid-1234',
      lunchPostId: 'post-uuid-1234',
      memberId: 'member-uuid-1234',
      rating: 4,
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
      ...overrides,
    };
  }

  beforeEach(async () => {
    reviewService = {
      create: vi.fn(),
      findByPost: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
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
    it('should call reviewService.create with correct arguments', async () => {
      // Arrange
      const dto = { rating: 4, content: '맛있었어요' };
      const mockReview = createMockReview();
      reviewService.create.mockResolvedValue(mockReview);

      // Act
      await controller.create('post-uuid-1234', mockMember, mockWorkspace, dto);

      // Assert
      expect(reviewService.create).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        dto,
      );
    });

    it('should return the created review', async () => {
      // Arrange
      const dto = { rating: 4, content: '맛있었어요' };
      const mockReview = createMockReview();
      reviewService.create.mockResolvedValue(mockReview);

      // Act
      const result = await controller.create('post-uuid-1234', mockMember, mockWorkspace, dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
      expect(result.content).toBe('맛있었어요');
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.create,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts/:id/reviews
  // ─────────────────────────────────────────────
  describe('GET /posts/:id/reviews', () => {
    it('should call reviewService.findByPost with correct arguments', async () => {
      // Arrange
      reviewService.findByPost.mockResolvedValue([]);

      // Act
      await controller.findByPost('post-uuid-1234', mockWorkspace);

      // Assert
      expect(reviewService.findByPost).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockWorkspace.id,
      );
    });

    it('should return reviews for the post', async () => {
      // Arrange
      const mockReviews = [
        createMockReview({ id: 'review-1' }),
        createMockReview({ id: 'review-2', rating: 3 }),
      ];
      reviewService.findByPost.mockResolvedValue(mockReviews);

      // Act
      const result = await controller.findByPost('post-uuid-1234', mockWorkspace);

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.findByPost,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /reviews/:id
  // ─────────────────────────────────────────────
  describe('PATCH /reviews/:id', () => {
    it('should call reviewService.update with correct arguments', async () => {
      // Arrange
      const dto = { rating: 5, content: '수정된 리뷰' };
      const mockReview = createMockReview({ rating: 5, content: '수정된 리뷰' });
      reviewService.update.mockResolvedValue(mockReview);

      // Act
      await controller.update('review-uuid-1234', mockMember, dto);

      // Assert
      expect(reviewService.update).toHaveBeenCalledWith(
        'review-uuid-1234',
        mockMember.id,
        dto,
      );
    });

    it('should return the updated review', async () => {
      // Arrange
      const dto = { rating: 5 };
      const mockReview = createMockReview({ rating: 5 });
      reviewService.update.mockResolvedValue(mockReview);

      // Act
      const result = await controller.update('review-uuid-1234', mockMember, dto);

      // Assert
      expect(result.rating).toBe(5);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.update,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /reviews/:id
  // ─────────────────────────────────────────────
  describe('DELETE /reviews/:id', () => {
    it('should call reviewService.remove with correct arguments', async () => {
      // Arrange
      reviewService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove('review-uuid-1234', mockMember);

      // Assert
      expect(reviewService.remove).toHaveBeenCalledWith(
        'review-uuid-1234',
        mockMember.id,
      );
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ReviewController.prototype.remove,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
