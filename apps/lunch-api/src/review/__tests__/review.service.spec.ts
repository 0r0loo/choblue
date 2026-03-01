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

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let lunchPostRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let participationRepository: {
    findOne: ReturnType<typeof vi.fn>;
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
      rating: 4,
      content: '맛있었어요',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      lunchPost: createMockLunchPost(),
      member: mockMember,
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
    reviewRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      delete: vi.fn(),
    };
    lunchPostRepository = {
      findOne: vi.fn(),
    };
    participationRepository = {
      findOne: vi.fn(),
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
    const dto = { rating: 4, content: '맛있었어요' };

    it('should create a review when conditions are valid', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const mockReview = createMockReview();

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(null);
      reviewRepository.create.mockReturnValue(mockReview);
      reviewRepository.save.mockResolvedValue(mockReview);

      // Act
      const result = await service.create(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        dto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
      expect(result.content).toBe('맛있었어요');
      expect(reviewRepository.create).toHaveBeenCalledWith({
        lunchPostId: 'post-uuid-1234',
        memberId: mockMember.id,
        rating: 4,
        content: '맛있었어요',
      });
      expect(reviewRepository.save).toHaveBeenCalledWith(mockReview);
    });

    it('should set content to null when content is not provided', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const mockReview = createMockReview({ content: null });

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(null);
      reviewRepository.create.mockReturnValue(mockReview);
      reviewRepository.save.mockResolvedValue(mockReview);

      // Act
      await service.create(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
        { rating: 5 },
      );

      // Assert
      expect(reviewRepository.create).toHaveBeenCalledWith({
        lunchPostId: 'post-uuid-1234',
        memberId: mockMember.id,
        rating: 5,
        content: null,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create('non-existent-id', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when post belongs to a different workspace', async () => {
      // Arrange
      const otherWorkspacePost = createMockLunchPost({
        workspaceId: 'other-workspace-uuid',
      });
      lunchPostRepository.findOne.mockResolvedValue(otherWorkspacePost);

      // Act & Assert
      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post is not CLOSED', async () => {
      // Arrange
      const openPost = createMockLunchPost({ status: LunchPostStatus.OPEN });
      lunchPostRepository.findOne.mockResolvedValue(openPost);

      // Act & Assert
      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when member is not a participant', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create('post-uuid-1234', mockMember.id, mockWorkspace.id, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when review already exists', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();
      const existingReview = createMockReview();

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(mockParticipation);
      reviewRepository.findOne.mockResolvedValue(existingReview);

      // Act & Assert
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
      // Arrange
      const mockPost = createMockLunchPost();
      const mockReviews = [
        createMockReview({ id: 'review-1' }),
        createMockReview({ id: 'review-2', rating: 3, content: '보통이에요' }),
      ];

      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      reviewRepository.find.mockResolvedValue(mockReviews);

      // Act
      const result = await service.findByPost('post-uuid-1234', mockWorkspace.id);

      // Assert
      expect(result).toHaveLength(2);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { lunchPostId: 'post-uuid-1234' },
        relations: { member: true },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no reviews exist', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      reviewRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByPost('post-uuid-1234', mockWorkspace.id);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findByPost('non-existent-id', mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(
        service.findByPost('post-uuid-1234', mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when post belongs to a different workspace', async () => {
      // Arrange
      const otherWorkspacePost = createMockLunchPost({
        workspaceId: 'other-workspace-uuid',
      });
      lunchPostRepository.findOne.mockResolvedValue(otherWorkspacePost);

      // Act & Assert
      await expect(
        service.findByPost('post-uuid-1234', mockWorkspace.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('should update rating when provided', async () => {
      // Arrange
      const mockReview = createMockReview();
      const updatedReview = createMockReview({ rating: 5 });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue(updatedReview);

      // Act
      const result = await service.update('review-uuid-1234', mockMember.id, {
        rating: 5,
      });

      // Assert
      expect(result.rating).toBe(5);
      expect(reviewRepository.save).toHaveBeenCalled();
    });

    it('should update content when provided', async () => {
      // Arrange
      const mockReview = createMockReview();
      const updatedReview = createMockReview({ content: '변경된 리뷰' });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue(updatedReview);

      // Act
      const result = await service.update('review-uuid-1234', mockMember.id, {
        content: '변경된 리뷰',
      });

      // Assert
      expect(result.content).toBe('변경된 리뷰');
    });

    it('should update both rating and content', async () => {
      // Arrange
      const mockReview = createMockReview();
      const updatedReview = createMockReview({ rating: 2, content: '별로' });
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.save.mockResolvedValue(updatedReview);

      // Act
      const result = await service.update('review-uuid-1234', mockMember.id, {
        rating: 2,
        content: '별로',
      });

      // Assert
      expect(result.rating).toBe(2);
      expect(result.content).toBe('별로');
    });

    it('should throw NotFoundException when review does not exist', async () => {
      // Arrange
      reviewRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-id', mockMember.id, { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when member is not the author', async () => {
      // Arrange
      const mockReview = createMockReview({ memberId: 'other-member-uuid' });
      reviewRepository.findOne.mockResolvedValue(mockReview);

      // Act & Assert
      await expect(
        service.update('review-uuid-1234', mockMember.id, { rating: 5 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('should delete the review', async () => {
      // Arrange
      const mockReview = createMockReview();
      reviewRepository.findOne.mockResolvedValue(mockReview);
      reviewRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove('review-uuid-1234', mockMember.id);

      // Assert
      expect(reviewRepository.delete).toHaveBeenCalledWith('review-uuid-1234');
    });

    it('should throw NotFoundException when review does not exist', async () => {
      // Arrange
      reviewRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove('non-existent-id', mockMember.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when member is not the author', async () => {
      // Arrange
      const mockReview = createMockReview({ memberId: 'other-member-uuid' });
      reviewRepository.findOne.mockResolvedValue(mockReview);

      // Act & Assert
      await expect(
        service.remove('review-uuid-1234', mockMember.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
