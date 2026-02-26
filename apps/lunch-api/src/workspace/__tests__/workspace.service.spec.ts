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
import { WorkspaceService } from '../workspace.service';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import { JoinWorkspaceDto } from '../dto/join-workspace.dto';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let workspaceRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  let memberRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  let mockManager: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    workspaceRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      count: vi.fn(),
    };
    memberRepository = {
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      count: vi.fn(),
    };
    mockManager = {
      create: vi.fn(),
      save: vi.fn(),
    };
    mockDataSource = {
      transaction: vi.fn((cb: (manager: typeof mockManager) => Promise<unknown>) =>
        cb(mockManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: workspaceRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateWorkspaceDto = {
      name: 'Engineering Team',
      description: 'A workspace for engineers',
    };

    function setupCreateMocks() {
      mockManager.create
        .mockReturnValueOnce(mockWorkspace)
        .mockReturnValueOnce(mockAdminMember);
      mockManager.save
        .mockResolvedValueOnce(mockWorkspace)
        .mockResolvedValueOnce(mockAdminMember);
    }

    it('should create a workspace with name and description', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.workspace).toBeDefined();
      expect(result.workspace.name).toBe('Engineering Team');
    });

    it('should auto-generate slug from name', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.workspace.slug).toBeDefined();
      expect(result.workspace.slug.length).toBeGreaterThan(0);
    });

    it('should auto-generate inviteCode as UUID v4', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.workspace.inviteCode).toBeDefined();
      expect(result.workspace.inviteCode.length).toBeGreaterThan(0);
    });

    it('should auto-generate adminToken as UUID v4', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.workspace.adminToken).toBeDefined();
      expect(result.workspace.adminToken.length).toBeGreaterThan(0);
    });

    it('should register the creator as an ADMIN member', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.member).toBeDefined();
      expect(result.member.role).toBe(MemberRole.ADMIN);
      expect(result.member.nickname).toBe('관리자');
    });

    it('should return a cookieToken for the created member', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.cookieToken).toBeDefined();
      expect(typeof result.cookieToken).toBe('string');
      expect(result.cookieToken.length).toBeGreaterThan(0);
    });

    it('should execute workspace and member creation within a transaction', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      await service.create(createDto);

      // Assert
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should call manager.save for workspace and member', async () => {
      // Arrange
      setupCreateMocks();

      // Act
      await service.create(createDto);

      // Assert
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when name is shorter than 2 characters', async () => {
      // Arrange
      const shortNameDto: CreateWorkspaceDto = { name: 'A' };

      // Act & Assert
      await expect(service.create(shortNameDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when name is longer than 30 characters', async () => {
      // Arrange
      const longNameDto: CreateWorkspaceDto = {
        name: 'A'.repeat(31),
      };

      // Act & Assert
      await expect(service.create(longNameDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept name with exactly 2 characters', async () => {
      // Arrange
      const minNameDto: CreateWorkspaceDto = { name: 'AB' };
      setupCreateMocks();

      // Act & Assert
      await expect(service.create(minNameDto)).resolves.toBeDefined();
    });

    it('should accept name with exactly 30 characters', async () => {
      // Arrange
      const maxNameDto: CreateWorkspaceDto = {
        name: 'A'.repeat(30),
      };
      setupCreateMocks();

      // Act & Assert
      await expect(service.create(maxNameDto)).resolves.toBeDefined();
    });
  });

  describe('findByInviteCode', () => {
    it('should return workspace info when inviteCode exists', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);

      // Act
      const result = await service.findByInviteCode('invite-code-uuid-v4');

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Engineering Team');
      expect(result.memberCount).toBe(5);
    });

    it('should return description as null when workspace has no description', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(3);

      // Act
      const result = await service.findByInviteCode('invite-code-uuid-v4');

      // Assert
      expect(result.description).toBeNull();
    });

    it('should throw NotFoundException when inviteCode does not exist', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findByInviteCode('non-existent-code'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should query workspaceRepository with the given inviteCode', async () => {
      // Arrange
      const inviteCode = 'invite-code-uuid-v4';
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);

      // Act
      await service.findByInviteCode(inviteCode);

      // Assert
      expect(workspaceRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { inviteCode },
        }),
      );
    });
  });

  describe('join', () => {
    const joinDto: JoinWorkspaceDto = {
      nickname: 'alice',
      inviteCode: 'invite-code-uuid-v4',
    };

    it('should create a new MEMBER when inviteCode is valid', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);
      memberRepository.create.mockReturnValue(mockRegularMember);
      memberRepository.save.mockResolvedValue(mockRegularMember);

      // Act
      const result = await service.join('workspace-uuid-1234', joinDto);

      // Assert
      expect(result.member).toBeDefined();
      expect(result.member.role).toBe(MemberRole.MEMBER);
      expect(result.member.nickname).toBe('alice');
    });

    it('should return a cookieToken for the newly joined member', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);
      memberRepository.create.mockReturnValue(mockRegularMember);
      memberRepository.save.mockResolvedValue(mockRegularMember);

      // Act
      const result = await service.join('workspace-uuid-1234', joinDto);

      // Assert
      expect(result.cookieToken).toBeDefined();
      expect(typeof result.cookieToken).toBe('string');
      expect(result.cookieToken.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException when inviteCode does not match', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      const wrongCodeDto: JoinWorkspaceDto = {
        nickname: 'alice',
        inviteCode: 'wrong-invite-code',
      };

      // Act & Assert
      await expect(
        service.join('workspace-uuid-1234', wrongCodeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when workspace has 50 members already', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(50);

      // Act & Assert
      await expect(
        service.join('workspace-uuid-1234', joinDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow joining when workspace has exactly 49 members', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(49);
      memberRepository.create.mockReturnValue(mockRegularMember);
      memberRepository.save.mockResolvedValue(mockRegularMember);

      // Act & Assert
      await expect(
        service.join('workspace-uuid-1234', joinDto),
      ).resolves.toBeDefined();
    });

    it('should throw NotFoundException when workspace does not exist', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.join('non-existent-workspace', joinDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when nickname is shorter than 2 characters', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);
      const shortNicknameDto: JoinWorkspaceDto = {
        nickname: 'A',
        inviteCode: 'invite-code-uuid-v4',
      };

      // Act & Assert
      await expect(
        service.join('workspace-uuid-1234', shortNicknameDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when nickname is longer than 10 characters', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);
      const longNicknameDto: JoinWorkspaceDto = {
        nickname: 'A'.repeat(11),
        inviteCode: 'invite-code-uuid-v4',
      };

      // Act & Assert
      await expect(
        service.join('workspace-uuid-1234', longNicknameDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call memberRepository.save with the new member', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(5);
      memberRepository.create.mockReturnValue(mockRegularMember);
      memberRepository.save.mockResolvedValue(mockRegularMember);

      // Act
      await service.join('workspace-uuid-1234', joinDto);

      // Assert
      expect(memberRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return workspace details with memberCount', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(10);

      // Act
      const result = await service.findOne('workspace-uuid-1234');

      // Assert
      expect(result.workspace).toBeDefined();
      expect(result.workspace.id).toBe('workspace-uuid-1234');
      expect(result.memberCount).toBe(10);
    });

    it('should throw NotFoundException when workspace does not exist', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne('non-existent-workspace'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should query workspaceRepository by id', async () => {
      // Arrange
      const workspaceId = 'workspace-uuid-1234';
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      memberRepository.count.mockResolvedValue(10);

      // Act
      await service.findOne(workspaceId);

      // Assert
      expect(workspaceRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: workspaceId },
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateWorkspaceDto = {
      name: 'Updated Team',
      description: 'Updated description',
    };

    it('should update workspace name and description', async () => {
      // Arrange
      const updatedWorkspace = {
        ...mockWorkspace,
        name: 'Updated Team',
        description: 'Updated description',
      };
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      workspaceRepository.save.mockResolvedValue(updatedWorkspace);

      // Act
      const result = await service.update(
        'workspace-uuid-1234',
        updateDto,
        mockAdminMember,
      );

      // Assert
      expect(result.name).toBe('Updated Team');
      expect(result.description).toBe('Updated description');
    });

    it('should throw ForbiddenException when member is not ADMIN', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);

      // Act & Assert
      await expect(
        service.update('workspace-uuid-1234', updateDto, mockRegularMember),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should call workspaceRepository.save with updated workspace', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      workspaceRepository.save.mockResolvedValue(mockWorkspace);

      // Act
      await service.update('workspace-uuid-1234', updateDto, mockAdminMember);

      // Assert
      expect(workspaceRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when workspace does not exist', async () => {
      // Arrange
      workspaceRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-workspace', updateDto, mockAdminMember),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only name when description is not provided', async () => {
      // Arrange
      const nameOnlyDto: UpdateWorkspaceDto = { name: 'New Name' };
      const updatedWorkspace = { ...mockWorkspace, name: 'New Name' };
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      workspaceRepository.save.mockResolvedValue(updatedWorkspace);

      // Act
      const result = await service.update(
        'workspace-uuid-1234',
        nameOnlyDto,
        mockAdminMember,
      );

      // Assert
      expect(result.name).toBe('New Name');
    });

    it('should update only description when name is not provided', async () => {
      // Arrange
      const descOnlyDto: UpdateWorkspaceDto = {
        description: 'New description',
      };
      const updatedWorkspace = {
        ...mockWorkspace,
        description: 'New description',
      };
      workspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      workspaceRepository.save.mockResolvedValue(updatedWorkspace);

      // Act
      const result = await service.update(
        'workspace-uuid-1234',
        descOnlyDto,
        mockAdminMember,
      );

      // Assert
      expect(result.description).toBe('New description');
    });
  });

  describe('findMembers', () => {
    it('should return a list of members for the workspace', async () => {
      // Arrange
      const members = [mockAdminMember, mockRegularMember];
      memberRepository.find.mockResolvedValue(members);

      // Act
      const result = await service.findMembers('workspace-uuid-1234');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].nickname).toBe('관리자');
      expect(result[1].nickname).toBe('alice');
    });

    it('should return an empty array when workspace has no members', async () => {
      // Arrange
      memberRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findMembers('workspace-uuid-1234');

      // Assert
      expect(result).toEqual([]);
    });

    it('should query memberRepository with the workspaceId', async () => {
      // Arrange
      const workspaceId = 'workspace-uuid-1234';
      memberRepository.find.mockResolvedValue([]);

      // Act
      await service.findMembers(workspaceId);

      // Assert
      expect(memberRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId },
        }),
      );
    });
  });
});
