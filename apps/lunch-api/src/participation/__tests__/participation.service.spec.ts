import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ParticipationService } from '../participation.service';
import { Participation } from '../../entities/participation.entity';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';

describe('ParticipationService', () => {
  let service: ParticipationService;
  let participationRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  let lunchPostRepository: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let mockManager: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  let mockDataSource: {
    transaction: ReturnType<typeof vi.fn>;
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

  const mockAuthor: Member = {
    id: 'author-member-uuid',
    nickname: 'alice',
    cookieToken: 'author-cookie-token',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
    reviews: [],
  };

  const mockParticipant: Member = {
    id: 'participant-member-uuid',
    nickname: 'bob',
    cookieToken: 'participant-cookie-token',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
    reviews: [],
  };

  const mockOtherWorkspaceMember: Member = {
    id: 'other-workspace-member-uuid',
    nickname: 'charlie',
    cookieToken: 'other-workspace-cookie-token',
    role: MemberRole.MEMBER,
    workspaceId: 'other-workspace-uuid',
    workspace: { ...mockWorkspace, id: 'other-workspace-uuid' },
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
      status: LunchPostStatus.OPEN,
      isDeleted: false,
      workspaceId: 'workspace-uuid-1234',
      authorId: 'author-member-uuid',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      workspace: mockWorkspace,
      author: mockAuthor,
      participations: [],
      reviews: [],
      ...overrides,
    };
  }

  function createMockParticipation(overrides: Partial<Participation> = {}): Participation {
    return {
      id: 'participation-uuid-1234',
      lunchPostId: 'post-uuid-1234',
      memberId: 'participant-member-uuid',
      createdAt: new Date('2025-01-01'),
      lunchPost: createMockLunchPost(),
      member: mockParticipant,
      ...overrides,
    };
  }

  beforeEach(async () => {
    participationRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    lunchPostRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
    };
    mockManager = {
      findOne: vi.fn(),
      save: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    };
    mockDataSource = {
      transaction: vi.fn((cb: (manager: typeof mockManager) => Promise<unknown>) =>
        cb(mockManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationService,
        {
          provide: getRepositoryToken(Participation),
          useValue: participationRepository,
        },
        {
          provide: getRepositoryToken(LunchPost),
          useValue: lunchPostRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ParticipationService>(ParticipationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // participate
  // ─────────────────────────────────────────────
  describe('participate', () => {
    it('should create a participation when conditions are valid', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const newParticipation = createMockParticipation();

      mockManager.findOne
        .mockResolvedValueOnce(mockPost)   // find post
        .mockResolvedValueOnce(null);      // find existing participation
      mockManager.count.mockResolvedValue(1);
      mockManager.create.mockReturnValue(newParticipation);
      mockManager.save.mockResolvedValueOnce(newParticipation);

      // Act
      const result = await service.participate(
        'post-uuid-1234',
        mockParticipant.id,
        mockWorkspace.id,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.memberId).toBe(mockParticipant.id);
      expect(mockDataSource.transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      mockManager.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        service.participate('non-existent-id', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      mockManager.findOne.mockResolvedValueOnce(deletedPost);

      // Act & Assert
      await expect(
        service.participate('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when post belongs to a different workspace', async () => {
      // Arrange
      const otherWorkspacePost = createMockLunchPost({
        workspaceId: 'other-workspace-uuid',
      });
      mockManager.findOne.mockResolvedValueOnce(otherWorkspacePost);

      // Act & Assert
      await expect(
        service.participate('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post status is CLOSED', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      mockManager.findOne.mockResolvedValueOnce(closedPost);

      // Act & Assert
      await expect(
        service.participate('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when member already participates', async () => {
      // Arrange
      const existingParticipation = createMockParticipation();
      const mockPost = createMockLunchPost();
      mockManager.findOne
        .mockResolvedValueOnce(mockPost)              // find post
        .mockResolvedValueOnce(existingParticipation); // find existing participation

      // Act & Assert
      await expect(
        service.participate('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when participants count reaches maxParticipants', async () => {
      // Arrange
      const fullPost = createMockLunchPost({ maxParticipants: 2 });
      mockManager.findOne
        .mockResolvedValueOnce(fullPost)  // find post
        .mockResolvedValueOnce(null);     // find existing participation
      mockManager.count.mockResolvedValue(2);

      // Act & Assert
      await expect(
        service.participate('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should auto-close the post when participation fills maxParticipants', async () => {
      // Arrange
      const almostFullPost = createMockLunchPost({ maxParticipants: 3 });
      const newParticipation = createMockParticipation();

      mockManager.findOne
        .mockResolvedValueOnce(almostFullPost)  // find post
        .mockResolvedValueOnce(null);           // find existing participation
      // Current count is 2 (one below max), after adding this will be 3
      mockManager.count.mockResolvedValue(2);
      mockManager.create.mockReturnValue(newParticipation);
      mockManager.save
        .mockResolvedValueOnce(newParticipation)   // save participation
        .mockResolvedValueOnce(almostFullPost);    // save post (auto-close)

      // Act
      await service.participate(
        'post-uuid-1234',
        mockParticipant.id,
        mockWorkspace.id,
      );

      // Assert - post status should be set to CLOSED and saved via manager
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LunchPostStatus.CLOSED,
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // cancelParticipation
  // ─────────────────────────────────────────────
  describe('cancelParticipation', () => {
    it('should delete the participation', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const existingParticipation = createMockParticipation();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(existingParticipation);
      participationRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.cancelParticipation('post-uuid-1234', mockParticipant.id, mockWorkspace.id);

      // Assert
      expect(participationRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancelParticipation('non-existent-id', mockParticipant.id, mockWorkspace.id),
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
        service.cancelParticipation('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when member has not participated', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancelParticipation('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when post is CLOSED', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostRepository.findOne.mockResolvedValue(closedPost);

      // Act & Assert
      await expect(
        service.cancelParticipation('post-uuid-1234', mockParticipant.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the author tries to cancel', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const authorParticipation = createMockParticipation({
        memberId: 'author-member-uuid',
        member: mockAuthor,
      });
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      participationRepository.findOne.mockResolvedValue(authorParticipation);

      // Act & Assert
      await expect(
        service.cancelParticipation('post-uuid-1234', mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
