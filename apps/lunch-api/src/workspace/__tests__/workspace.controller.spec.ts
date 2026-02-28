import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from '../workspace.controller';
import { WorkspaceService } from '../workspace.service';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { JoinWorkspaceDto } from '../dto/join-workspace.dto';
import { AUTH_COOKIE_NAME } from '../../auth/constants';
import { CookieGuard } from '../../auth/cookie.guard';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  let workspaceService: {
    create: ReturnType<typeof vi.fn>;
    findByInviteCode: ReturnType<typeof vi.fn>;
    join: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findMembers: ReturnType<typeof vi.fn>;
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

  const mockAdminMember: Member = {
    id: 'admin-member-uuid',
    nickname: '관리자',
    cookieToken: 'admin-cookie-token',
    role: MemberRole.ADMIN,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
  };

  const mockRegularMember: Member = {
    id: 'regular-member-uuid',
    nickname: 'alice',
    cookieToken: 'regular-cookie-token',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
  };

  function createMockResponse() {
    return {
      cookie: vi.fn(),
    } as unknown as import('express').Response;
  }

  beforeEach(async () => {
    workspaceService = {
      create: vi.fn(),
      findByInviteCode: vi.fn(),
      join: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      findMembers: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: WorkspaceService,
          useValue: workspaceService,
        },
      ],
    })
      .overrideGuard(CookieGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /workspaces (create)', () => {
    const createDto: CreateWorkspaceDto = {
      name: 'Engineering Team',
      description: 'A workspace for engineers',
      nickname: '관리자',
    };

    it('should call workspaceService.create with the dto', async () => {
      // Arrange
      const res = createMockResponse();
      workspaceService.create.mockResolvedValue({
        workspace: mockWorkspace,
        member: mockAdminMember,
        cookieToken: 'admin-cookie-token',
      });

      // Act
      await controller.create(createDto, res);

      // Assert
      expect(workspaceService.create).toHaveBeenCalledWith(createDto);
    });

    it('should return workspace and member info', async () => {
      // Arrange
      const res = createMockResponse();
      const serviceResult = {
        workspace: mockWorkspace,
        member: mockAdminMember,
        cookieToken: 'admin-cookie-token',
      };
      workspaceService.create.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.create(createDto, res);

      // Assert
      expect(result).toHaveProperty('workspace');
      expect(result).toHaveProperty('member');
    });

    it('should set lunch_token cookie on the response', async () => {
      // Arrange
      const res = createMockResponse();
      workspaceService.create.mockResolvedValue({
        workspace: mockWorkspace,
        member: mockAdminMember,
        cookieToken: 'admin-cookie-token',
      });

      // Act
      await controller.create(createDto, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'admin-cookie-token',
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });
  });

  describe('GET /workspaces/by-invite/:code (findByInviteCode)', () => {
    it('should call workspaceService.findByInviteCode with the code', async () => {
      // Arrange
      const inviteCode = 'invite-code-uuid-v4';
      workspaceService.findByInviteCode.mockResolvedValue({
        name: 'Engineering Team',
        description: null,
        memberCount: 5,
      });

      // Act
      await controller.findByInviteCode(inviteCode);

      // Assert
      expect(workspaceService.findByInviteCode).toHaveBeenCalledWith(
        inviteCode,
      );
    });

    it('should return workspace name, description, and memberCount', async () => {
      // Arrange
      const expectedResult = {
        name: 'Engineering Team',
        description: null,
        memberCount: 5,
      };
      workspaceService.findByInviteCode.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findByInviteCode('invite-code-uuid-v4');

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  describe('POST /workspaces/:id/members (join)', () => {
    const joinDto: JoinWorkspaceDto = {
      nickname: 'alice',
      inviteCode: 'invite-code-uuid-v4',
    };

    it('should call workspaceService.join with workspace id and dto', async () => {
      // Arrange
      const res = createMockResponse();
      workspaceService.join.mockResolvedValue({
        member: mockRegularMember,
        cookieToken: 'regular-cookie-token',
      });

      // Act
      await controller.join('workspace-uuid-1234', joinDto, res);

      // Assert
      expect(workspaceService.join).toHaveBeenCalledWith(
        'workspace-uuid-1234',
        joinDto,
      );
    });

    it('should return member info', async () => {
      // Arrange
      const res = createMockResponse();
      workspaceService.join.mockResolvedValue({
        member: mockRegularMember,
        cookieToken: 'regular-cookie-token',
      });

      // Act
      const result = await controller.join(
        'workspace-uuid-1234',
        joinDto,
        res,
      );

      // Assert
      expect(result).toHaveProperty('member');
    });

    it('should set lunch_token cookie on the response', async () => {
      // Arrange
      const res = createMockResponse();
      workspaceService.join.mockResolvedValue({
        member: mockRegularMember,
        cookieToken: 'regular-cookie-token',
      });

      // Act
      await controller.join('workspace-uuid-1234', joinDto, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        AUTH_COOKIE_NAME,
        'regular-cookie-token',
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });
  });

  describe('GET /workspaces/:id (findOne)', () => {
    it('should call workspaceService.findOne with the workspace id', async () => {
      // Arrange
      workspaceService.findOne.mockResolvedValue({
        workspace: mockWorkspace,
        memberCount: 10,
      });

      // Act
      await controller.findOne(mockWorkspace);

      // Assert
      expect(workspaceService.findOne).toHaveBeenCalledWith(
        mockWorkspace.id,
      );
    });

    it('should return workspace info with memberCount', async () => {
      // Arrange
      const expectedResult = {
        workspace: mockWorkspace,
        memberCount: 10,
      };
      workspaceService.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findOne(mockWorkspace);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        WorkspaceController.prototype.findOne,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  describe('PATCH /workspaces/:id (update)', () => {
    const updateDto: UpdateWorkspaceDto = {
      name: 'Updated Team',
      description: 'Updated description',
    };

    it('should call workspaceService.update with id, dto, and member', async () => {
      // Arrange
      workspaceService.update.mockResolvedValue({
        ...mockWorkspace,
        name: 'Updated Team',
      });

      // Act
      await controller.update(
        'workspace-uuid-1234',
        updateDto,
        mockAdminMember,
      );

      // Assert
      expect(workspaceService.update).toHaveBeenCalledWith(
        'workspace-uuid-1234',
        updateDto,
        mockAdminMember,
      );
    });

    it('should return the updated workspace', async () => {
      // Arrange
      const updatedWorkspace = { ...mockWorkspace, name: 'Updated Team' };
      workspaceService.update.mockResolvedValue(updatedWorkspace);

      // Act
      const result = await controller.update(
        'workspace-uuid-1234',
        updateDto,
        mockAdminMember,
      );

      // Assert
      expect(result.name).toBe('Updated Team');
    });

    it('should throw ForbiddenException when workspace id does not match member', async () => {
      // Act & Assert
      await expect(
        controller.update('different-workspace-id', updateDto, mockAdminMember),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        WorkspaceController.prototype.update,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  describe('GET /workspaces/:id/members (findMembers)', () => {
    it('should call workspaceService.findMembers with the workspace id', async () => {
      // Arrange
      workspaceService.findMembers.mockResolvedValue([
        mockAdminMember,
        mockRegularMember,
      ]);

      // Act
      await controller.findMembers('workspace-uuid-1234', mockAdminMember);

      // Assert
      expect(workspaceService.findMembers).toHaveBeenCalledWith(
        'workspace-uuid-1234',
      );
    });

    it('should return the list of members', async () => {
      // Arrange
      const members = [mockAdminMember, mockRegularMember];
      workspaceService.findMembers.mockResolvedValue(members);

      // Act
      const result = await controller.findMembers(
        'workspace-uuid-1234',
        mockAdminMember,
      );

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should throw ForbiddenException when workspace id does not match member', async () => {
      // Act & Assert
      await expect(
        controller.findMembers('different-workspace-id', mockAdminMember),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        WorkspaceController.prototype.findMembers,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
