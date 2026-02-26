import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { LunchPostController } from '../lunch-post.controller';
import { LunchPostService } from '../lunch-post.service';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CookieGuard } from '../../auth/cookie.guard';
import { CreateLunchPostDto } from '../dto/create-lunch-post.dto';
import { UpdateLunchPostDto } from '../dto/update-lunch-post.dto';

describe('LunchPostController', () => {
  let controller: LunchPostController;
  let lunchPostService: {
    create: ReturnType<typeof vi.fn>;
    findByDate: ReturnType<typeof vi.fn>;
    getCalendarData: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
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
    nickname: 'alice',
    cookieToken: 'cookie-token-1234',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
  };

  function createMockLunchPost(overrides: Partial<LunchPost> = {}): LunchPost {
    return {
      id: 'post-uuid-1234',
      menu: '짬뽕',
      restaurant: '중화반점',
      date: '2026-02-27',
      time: '12:00',
      maxParticipants: 4,
      status: LunchPostStatus.OPEN,
      isDeleted: false,
      workspaceId: 'workspace-uuid-1234',
      authorId: 'member-uuid-1234',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      workspace: mockWorkspace,
      author: mockMember,
      participations: [],
      ...overrides,
    };
  }

  beforeEach(async () => {
    lunchPostService = {
      create: vi.fn(),
      findByDate: vi.fn(),
      getCalendarData: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      close: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LunchPostController],
      providers: [
        {
          provide: LunchPostService,
          useValue: lunchPostService,
        },
      ],
    }).compile();

    controller = module.get<LunchPostController>(LunchPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // GET /workspaces/:workspaceId/posts (findByDate)
  // ─────────────────────────────────────────────
  describe('GET /workspaces/:workspaceId/posts (findByDate)', () => {
    it('should call lunchPostService.findByDate with workspaceId and date', async () => {
      // Arrange
      const date = '2026-02-27';
      const mockPosts = [createMockLunchPost()];
      lunchPostService.findByDate.mockResolvedValue(mockPosts);

      // Act
      await controller.findByDate('workspace-uuid-1234', date, mockWorkspace);

      // Assert
      expect(lunchPostService.findByDate).toHaveBeenCalledWith(
        mockWorkspace.id,
        date,
      );
    });

    it('should return the list of lunch posts', async () => {
      // Arrange
      const mockPosts = [createMockLunchPost()];
      lunchPostService.findByDate.mockResolvedValue(mockPosts);

      // Act
      const result = await controller.findByDate(
        'workspace-uuid-1234',
        '2026-02-27',
        mockWorkspace,
      );

      // Assert
      expect(result).toHaveLength(1);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.findByDate,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /workspaces/:workspaceId/posts/calendar (getCalendarData)
  // ─────────────────────────────────────────────
  describe('GET /workspaces/:workspaceId/posts/calendar (getCalendarData)', () => {
    it('should call lunchPostService.getCalendarData with workspaceId and month', async () => {
      // Arrange
      const month = '2026-02';
      const calendarData = { '2026-02-25': 3, '2026-02-26': 1 };
      lunchPostService.getCalendarData.mockResolvedValue(calendarData);

      // Act
      await controller.getCalendarData('workspace-uuid-1234', month, mockWorkspace);

      // Assert
      expect(lunchPostService.getCalendarData).toHaveBeenCalledWith(
        mockWorkspace.id,
        month,
      );
    });

    it('should return the calendar data map', async () => {
      // Arrange
      const calendarData = { '2026-02-25': 3, '2026-02-26': 1 };
      lunchPostService.getCalendarData.mockResolvedValue(calendarData);

      // Act
      const result = await controller.getCalendarData(
        'workspace-uuid-1234',
        '2026-02',
        mockWorkspace,
      );

      // Assert
      expect(result).toEqual(calendarData);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.getCalendarData,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // POST /workspaces/:workspaceId/posts (create)
  // ─────────────────────────────────────────────
  describe('POST /workspaces/:workspaceId/posts (create)', () => {
    const createDto: CreateLunchPostDto = {
      menu: '짬뽕',
      restaurant: '중화반점',
      date: '2026-02-27',
      time: '12:00',
      maxParticipants: 4,
    };

    it('should call lunchPostService.create with dto, member id, and workspace id', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostService.create.mockResolvedValue(mockPost);

      // Act
      await controller.create('workspace-uuid-1234', createDto, mockMember, mockWorkspace);

      // Assert
      expect(lunchPostService.create).toHaveBeenCalledWith(
        createDto,
        mockMember.id,
        mockWorkspace.id,
      );
    });

    it('should return the created lunch post', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostService.create.mockResolvedValue(mockPost);

      // Act
      const result = await controller.create(
        'workspace-uuid-1234',
        createDto,
        mockMember,
        mockWorkspace,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.menu).toBe('짬뽕');
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.create,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // GET /posts/:id (findOne)
  // ─────────────────────────────────────────────
  describe('GET /posts/:id (findOne)', () => {
    it('should call lunchPostService.findOne with post id and workspace id', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostService.findOne.mockResolvedValue(mockPost);

      // Act
      await controller.findOne('post-uuid-1234', mockWorkspace);

      // Assert
      expect(lunchPostService.findOne).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockWorkspace.id,
      );
    });

    it('should return the lunch post detail', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostService.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await controller.findOne('post-uuid-1234', mockWorkspace);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('post-uuid-1234');
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.findOne,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // PATCH /posts/:id (update)
  // ─────────────────────────────────────────────
  describe('PATCH /posts/:id (update)', () => {
    const updateDto: UpdateLunchPostDto = {
      menu: '짜장면',
    };

    it('should call lunchPostService.update with post id, dto, and member id', async () => {
      // Arrange
      const updatedPost = createMockLunchPost({ menu: '짜장면' });
      lunchPostService.update.mockResolvedValue(updatedPost);

      // Act
      await controller.update('post-uuid-1234', updateDto, mockMember);

      // Assert
      expect(lunchPostService.update).toHaveBeenCalledWith(
        'post-uuid-1234',
        updateDto,
        mockMember.id,
      );
    });

    it('should return the updated lunch post', async () => {
      // Arrange
      const updatedPost = createMockLunchPost({ menu: '짜장면' });
      lunchPostService.update.mockResolvedValue(updatedPost);

      // Act
      const result = await controller.update('post-uuid-1234', updateDto, mockMember);

      // Assert
      expect(result.menu).toBe('짜장면');
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.update,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /posts/:id (remove)
  // ─────────────────────────────────────────────
  describe('DELETE /posts/:id (remove)', () => {
    it('should call lunchPostService.remove with post id and member id', async () => {
      // Arrange
      lunchPostService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove('post-uuid-1234', mockMember);

      // Assert
      expect(lunchPostService.remove).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
      );
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.remove,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });

  // ─────────────────────────────────────────────
  // POST /posts/:id/close (close)
  // ─────────────────────────────────────────────
  describe('POST /posts/:id/close (close)', () => {
    it('should call lunchPostService.close with post id and member id', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostService.close.mockResolvedValue(closedPost);

      // Act
      await controller.close('post-uuid-1234', mockMember);

      // Assert
      expect(lunchPostService.close).toHaveBeenCalledWith(
        'post-uuid-1234',
        mockMember.id,
      );
    });

    it('should return the closed lunch post', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostService.close.mockResolvedValue(closedPost);

      // Act
      const result = await controller.close('post-uuid-1234', mockMember);

      // Assert
      expect(result.status).toBe(LunchPostStatus.CLOSED);
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        LunchPostController.prototype.close,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
