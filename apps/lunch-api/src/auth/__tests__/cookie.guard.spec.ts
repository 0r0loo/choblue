import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CookieGuard } from '../cookie.guard';
import { Member, MemberRole } from '../../entities/member.entity';
import { Workspace } from '../../entities/workspace.entity';

describe('CookieGuard', () => {
  let guard: CookieGuard;
  let memberRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  const mockWorkspace: Workspace = {
    id: 'workspace-uuid-1234',
    name: 'Test Workspace',
    slug: 'test-workspace',
    inviteCode: 'INVITE123',
    adminToken: 'admin-token-xyz',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    members: [],
    lunchPosts: [],
  };

  const mockMember: Member = {
    id: 'member-uuid-5678',
    nickname: 'alice',
    cookieToken: 'valid-cookie-token-abc',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
    reviews: [],
  };

  function createMockExecutionContext(cookies: Record<string, string> = {}): ExecutionContext {
    const mockRequest = {
      cookies,
    } as Record<string, unknown>;

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(async () => {
    memberRepository = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookieGuard,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,
        },
      ],
    }).compile();

    guard = module.get<CookieGuard>(CookieGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when lunch_token cookie is missing', async () => {
      // Arrange
      const context = createMockExecutionContext({});

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when lunch_token cookie is empty string', async () => {
      // Arrange
      const context = createMockExecutionContext({ lunch_token: '' });

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when member is not found by cookie token', async () => {
      // Arrange
      const context = createMockExecutionContext({ lunch_token: 'non-existent-token' });
      memberRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should query member repository with workspace relation', async () => {
      // Arrange
      const cookieToken = 'valid-cookie-token-abc';
      const context = createMockExecutionContext({ lunch_token: cookieToken });
      memberRepository.findOne.mockResolvedValue(mockMember);

      // Act
      await guard.canActivate(context);

      // Assert
      expect(memberRepository.findOne).toHaveBeenCalledWith({
        where: { cookieToken },
        relations: { workspace: true },
      });
    });

    it('should set request.member when valid lunch_token is provided', async () => {
      // Arrange
      const context = createMockExecutionContext({ lunch_token: 'valid-cookie-token-abc' });
      memberRepository.findOne.mockResolvedValue(mockMember);
      const request = context.switchToHttp().getRequest() as Record<string, unknown>;

      // Act
      await guard.canActivate(context);

      // Assert
      expect(request.member).toBe(mockMember);
    });

    it('should set request.workspace to the member workspace when valid lunch_token is provided', async () => {
      // Arrange
      const context = createMockExecutionContext({ lunch_token: 'valid-cookie-token-abc' });
      memberRepository.findOne.mockResolvedValue(mockMember);
      const request = context.switchToHttp().getRequest() as Record<string, unknown>;

      // Act
      await guard.canActivate(context);

      // Assert
      expect(request.workspace).toBe(mockWorkspace);
    });

    it('should return true when valid lunch_token is provided and member is found', async () => {
      // Arrange
      const context = createMockExecutionContext({ lunch_token: 'valid-cookie-token-abc' });
      memberRepository.findOne.mockResolvedValue(mockMember);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
