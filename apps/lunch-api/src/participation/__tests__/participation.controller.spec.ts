import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationController } from '../participation.controller';
import { ParticipationService } from '../participation.service';
import { Participation } from '../../entities/participation.entity';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CookieGuard } from '../../auth/cookie.guard';

describe('ParticipationController', () => {
  let controller: ParticipationController;
  let participationService: {
    participate: ReturnType<typeof vi.fn>;
    cancelParticipation: ReturnType<typeof vi.fn>;
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
  };

  function createMockParticipation(overrides: Partial<Participation> = {}): Participation {
    return {
      id: 'participation-uuid-1234',
      lunchPostId: 'post-uuid-1234',
      memberId: 'member-uuid-1234',
      createdAt: new Date('2025-01-01'),
      lunchPost: {
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
        author: mockMember,
        participations: [],
      },
      member: mockMember,
      ...overrides,
    };
  }

  beforeEach(async () => {
    participationService = {
      participate: vi.fn(),
      cancelParticipation: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipationController],
      providers: [
        {
          provide: ParticipationService,
          useValue: participationService,
        },
      ],
    })
      .overrideGuard(CookieGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ParticipationController>(ParticipationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // POST /posts/:id/participate
  // ─────────────────────────────────────────────
  describe('POST /posts/:id/participate', () => {
    it('should call participationService.participate with postId, memberId, and workspaceId', async () => {
      // Arrange
      const mockParticipation = createMockParticipation();
      participationService.participate.mockResolvedValue(mockParticipation);

      // Act
      await controller.participate('post-uuid-1234', mockMember, mockWorkspace);

      // Assert
      expect(participationService.participate).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
      );
    });

    it('should return the created participation', async () => {
      // Arrange
      const mockParticipation = createMockParticipation();
      participationService.participate.mockResolvedValue(mockParticipation);

      // Act
      const result = await controller.participate('post-uuid-1234', mockMember, mockWorkspace);

      // Assert
      expect(result).toBeDefined();
      expect(result.memberId).toBe(mockMember.id);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ParticipationController.prototype.participate,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /posts/:id/participate
  // ─────────────────────────────────────────────
  describe('DELETE /posts/:id/participate', () => {
    it('should call participationService.cancelParticipation with postId, memberId, and workspaceId', async () => {
      // Arrange
      participationService.cancelParticipation.mockResolvedValue(undefined);

      // Act
      await controller.cancelParticipation('post-uuid-1234', mockMember, mockWorkspace);

      // Assert
      expect(participationService.cancelParticipation).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
        mockWorkspace.id,
      );
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        ParticipationController.prototype.cancelParticipation,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
