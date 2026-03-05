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
import { LunchPostService } from '../lunch-post.service';
import { LunchPost, LunchPostStatus } from '../../entities/lunch-post.entity';
import { Participation } from '../../entities/participation.entity';
import { Workspace } from '../../entities/workspace.entity';
import { Member, MemberRole } from '../../entities/member.entity';
import { CreateLunchPostDto } from '../dto/create-lunch-post.dto';
import { UpdateLunchPostDto } from '../dto/update-lunch-post.dto';

describe('LunchPostService', () => {
  let service: LunchPostService;
  let lunchPostRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
  let participationRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
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
    restaurants: [],
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

  const mockOtherMember: Member = {
    id: 'other-member-uuid',
    nickname: 'bob',
    cookieToken: 'other-cookie-token',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    workspace: mockWorkspace,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lunchPosts: [],
    participations: [],
    reviews: [],
  };

  // Helper: future date (tomorrow) in YYYY-MM-DD format
  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Helper: past date (yesterday) in YYYY-MM-DD format
  function getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  const VALID_TIME = '12:00';
  const VALID_MAX_PARTICIPANTS = 4;

  function createMockLunchPost(overrides: Partial<LunchPost> = {}): LunchPost {
    return {
      id: 'post-uuid-1234',
      menu: '짬뽕',
      restaurant: '중화반점',
      date: getTomorrowDate(),
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
      memberId: 'author-member-uuid',
      createdAt: new Date('2025-01-01'),
      lunchPost: createMockLunchPost(),
      member: mockAuthor,
      ...overrides,
    };
  }

  beforeEach(async () => {
    lunchPostRepository = {
      create: vi.fn(),
      save: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
    };
    participationRepository = {
      create: vi.fn(),
      save: vi.fn(),
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
        LunchPostService,
        {
          provide: getRepositoryToken(LunchPost),
          useValue: lunchPostRepository,
        },
        {
          provide: getRepositoryToken(Participation),
          useValue: participationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<LunchPostService>(LunchPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    const validDto: CreateLunchPostDto = {
      menu: '짬뽕',
      restaurant: '중화반점',
      date: '', // will be set in beforeEach or individual tests
      time: VALID_TIME,
      maxParticipants: VALID_MAX_PARTICIPANTS,
    };

    function createValidDto(overrides: Partial<CreateLunchPostDto> = {}): CreateLunchPostDto {
      return {
        menu: '짬뽕',
        restaurant: '중화반점',
        date: getTomorrowDate(),
        time: VALID_TIME,
        maxParticipants: VALID_MAX_PARTICIPANTS,
        ...overrides,
      };
    }

    function setupCreateMocks() {
      const mockPost = createMockLunchPost();
      const mockParticipation = createMockParticipation();

      mockManager.create
        .mockReturnValueOnce(mockPost)
        .mockReturnValueOnce(mockParticipation);
      mockManager.save
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(mockParticipation);

      return { mockPost, mockParticipation };
    }

    it('should create a lunch post with valid data', async () => {
      // Arrange
      const dto = createValidDto();
      const { mockPost } = setupCreateMocks();

      // Act
      const result = await service.create(dto, mockAuthor.id, mockWorkspace.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.menu).toBe('짬뽕');
    });

    it('should save menu, restaurant, date, time, maxParticipants', async () => {
      // Arrange
      const dto = createValidDto();
      setupCreateMocks();

      // Act
      await service.create(dto, mockAuthor.id, mockWorkspace.id);

      // Assert
      expect(mockManager.create).toHaveBeenCalledWith(
        LunchPost,
        expect.objectContaining({
          menu: '짬뽕',
          restaurant: '중화반점',
          date: dto.date,
          time: VALID_TIME,
          maxParticipants: VALID_MAX_PARTICIPANTS,
        }),
      );
    });

    it('should automatically create a participation for the author', async () => {
      // Arrange
      const dto = createValidDto();
      setupCreateMocks();

      // Act
      await service.create(dto, mockAuthor.id, mockWorkspace.id);

      // Assert
      expect(mockManager.create).toHaveBeenCalledWith(
        Participation,
        expect.objectContaining({
          memberId: mockAuthor.id,
        }),
      );
    });

    it('should execute post and participation creation within a transaction', async () => {
      // Arrange
      const dto = createValidDto();
      setupCreateMocks();

      // Act
      await service.create(dto, mockAuthor.id, mockWorkspace.id);

      // Assert
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });

    it('should set authorId and workspaceId on the post', async () => {
      // Arrange
      const dto = createValidDto();
      setupCreateMocks();

      // Act
      await service.create(dto, mockAuthor.id, mockWorkspace.id);

      // Assert
      expect(mockManager.create).toHaveBeenCalledWith(
        LunchPost,
        expect.objectContaining({
          authorId: mockAuthor.id,
          workspaceId: mockWorkspace.id,
        }),
      );
    });

    it('should throw BadRequestException when date is in the past', async () => {
      // Arrange
      const dto = createValidDto({ date: getYesterdayDate() });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when time is before 11:00', async () => {
      // Arrange
      const dto = createValidDto({ time: '10:30' });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when time is after 14:00', async () => {
      // Arrange
      const dto = createValidDto({ time: '14:30' });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when time is not on 30-minute boundary', async () => {
      // Arrange
      const dto = createValidDto({ time: '12:15' });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept all valid time slots (11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00)', async () => {
      const validTimes = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'];

      for (const time of validTimes) {
        // Arrange
        const dto = createValidDto({ time });
        setupCreateMocks();

        // Act & Assert
        await expect(
          service.create(dto, mockAuthor.id, mockWorkspace.id),
        ).resolves.toBeDefined();
      }
    });

    it('should throw BadRequestException when maxParticipants is less than 2', async () => {
      // Arrange
      const dto = createValidDto({ maxParticipants: 1 });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when maxParticipants is greater than 10', async () => {
      // Arrange
      const dto = createValidDto({ maxParticipants: 11 });

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept maxParticipants of exactly 2 (lower boundary)', async () => {
      // Arrange
      const dto = createValidDto({ maxParticipants: 2 });
      setupCreateMocks();

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).resolves.toBeDefined();
    });

    it('should accept maxParticipants of exactly 10 (upper boundary)', async () => {
      // Arrange
      const dto = createValidDto({ maxParticipants: 10 });
      setupCreateMocks();

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).resolves.toBeDefined();
    });

    it('should allow restaurant to be undefined (optional field)', async () => {
      // Arrange
      const dto = createValidDto({ restaurant: undefined });
      setupCreateMocks();

      // Act & Assert
      await expect(
        service.create(dto, mockAuthor.id, mockWorkspace.id),
      ).resolves.toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // findByDate
  // ─────────────────────────────────────────────
  describe('findByDate', () => {
    it('should return lunch posts for the given date', async () => {
      // Arrange
      const date = getTomorrowDate();
      const mockPosts = [
        createMockLunchPost({ id: 'post-1', date }),
        createMockLunchPost({ id: 'post-2', date }),
      ];
      lunchPostRepository.find.mockResolvedValue(mockPosts);

      // Act
      const result = await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should only return posts where isDeleted is false', async () => {
      // Arrange
      const date = getTomorrowDate();
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
          }),
        }),
      );
    });

    it('should include author and participations relations', async () => {
      // Arrange
      const date = getTomorrowDate();
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: expect.objectContaining({
            author: true,
            participations: expect.anything(),
          }),
        }),
      );
    });

    it('should sort by createdAt in descending order', async () => {
      // Arrange
      const date = getTomorrowDate();
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            createdAt: 'DESC',
          }),
        }),
      );
    });

    it('should filter by workspaceId', async () => {
      // Arrange
      const date = getTomorrowDate();
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId: mockWorkspace.id,
          }),
        }),
      );
    });

    it('should return an empty array when no posts exist for the date', async () => {
      // Arrange
      const date = getTomorrowDate();
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByDate(mockWorkspace.id, date);

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw BadRequestException when date format is invalid', async () => {
      // Arrange & Act & Assert
      await expect(
        service.findByDate(mockWorkspace.id, '2026-1-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when date is not a date string', async () => {
      // Arrange & Act & Assert
      await expect(
        service.findByDate(mockWorkspace.id, 'invalid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use today KST as default when date is empty string', async () => {
      // Arrange
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.findByDate(mockWorkspace.id, '');

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // getCalendarData
  // ─────────────────────────────────────────────
  describe('getCalendarData', () => {
    it('should return date-to-posts map for the given month', async () => {
      // Arrange
      const month = '2026-02';
      const mockPosts = [
        createMockLunchPost({ id: 'post-1', date: '2026-02-25', menu: '짬뽕', maxParticipants: 4, participations: [createMockParticipation(), createMockParticipation({ id: 'p2' })] }),
        createMockLunchPost({ id: 'post-2', date: '2026-02-25', menu: '짜장면', maxParticipants: 3, participations: [createMockParticipation({ id: 'p3' })] }),
        createMockLunchPost({ id: 'post-3', date: '2026-02-26', menu: '탕수육', maxParticipants: 5, participations: [] }),
      ];
      lunchPostRepository.find.mockResolvedValue(mockPosts);

      // Act
      const result = await service.getCalendarData(mockWorkspace.id, month);

      // Assert
      expect(result).toEqual({
        '2026-02-25': [
          { id: 'post-1', menu: '짬뽕', participantCount: 2, maxParticipants: 4 },
          { id: 'post-2', menu: '짜장면', participantCount: 1, maxParticipants: 3 },
        ],
        '2026-02-26': [
          { id: 'post-3', menu: '탕수육', participantCount: 0, maxParticipants: 5 },
        ],
      });
    });

    it('should only include posts where isDeleted is false', async () => {
      // Arrange
      const month = '2026-02';
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.getCalendarData(mockWorkspace.id, month);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
          }),
          relations: { participations: true },
        }),
      );
    });

    it('should return an empty object when no posts exist for the month', async () => {
      // Arrange
      const month = '2026-03';
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getCalendarData(mockWorkspace.id, month);

      // Assert
      expect(result).toEqual({});
    });

    it('should filter by workspaceId', async () => {
      // Arrange
      const month = '2026-02';
      lunchPostRepository.find.mockResolvedValue([]);

      // Act
      await service.getCalendarData(mockWorkspace.id, month);

      // Assert
      expect(lunchPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            workspaceId: mockWorkspace.id,
          }),
        }),
      );
    });

    it('should throw BadRequestException when month format is invalid', async () => {
      // Arrange & Act & Assert
      await expect(
        service.getCalendarData(mockWorkspace.id, '2026-2'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when month is empty string', async () => {
      // Arrange & Act & Assert
      await expect(
        service.getCalendarData(mockWorkspace.id, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when month contains extra characters', async () => {
      // Arrange & Act & Assert
      await expect(
        service.getCalendarData(mockWorkspace.id, '2026-02-01'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // findOne
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return the lunch post with author and participations', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await service.findOne('post-uuid-1234', mockWorkspace.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('post-uuid-1234');
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne('non-existent-id', mockWorkspace.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(
        service.findOne('post-uuid-1234', mockWorkspace.id),
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
        service.findOne('post-uuid-1234', mockWorkspace.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should include author and participations with member relations', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);

      // Act
      await service.findOne('post-uuid-1234', mockWorkspace.id);

      // Assert
      expect(lunchPostRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: expect.objectContaining({
            author: true,
            participations: expect.anything(),
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    const updateDto: UpdateLunchPostDto = {
      menu: '짜장면',
    };

    it('should update the lunch post when author requests it', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const updatedPost = createMockLunchPost({ menu: '짜장면' });
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue(updatedPost);

      // Act
      const result = await service.update('post-uuid-1234', updateDto, mockAuthor.id);

      // Assert
      expect(result.menu).toBe('짜장면');
    });

    it('should throw ForbiddenException when non-author tries to update', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', updateDto, mockOtherMember.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post is closed', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostRepository.findOne.mockResolvedValue(closedPost);

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', updateDto, mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('non-existent-id', updateDto, mockAuthor.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', updateDto, mockAuthor.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call lunchPostRepository.save with the updated post', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue({ ...mockPost, menu: '짜장면' });

      // Act
      await service.update('post-uuid-1234', updateDto, mockAuthor.id);

      // Assert
      expect(lunchPostRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const partialDto: UpdateLunchPostDto = { restaurant: '새 가게' };
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue({ ...mockPost, restaurant: '새 가게' });

      // Act
      const result = await service.update('post-uuid-1234', partialDto, mockAuthor.id);

      // Assert
      expect(result.restaurant).toBe('새 가게');
    });

    it('should throw BadRequestException when updating date to a past date', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      const pastDateDto: UpdateLunchPostDto = { date: getYesterdayDate() };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', pastDateDto, mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating time to an invalid time', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      const invalidTimeDto: UpdateLunchPostDto = { time: '10:30' };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', invalidTimeDto, mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating maxParticipants below 2', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      const invalidMaxDto: UpdateLunchPostDto = { maxParticipants: 1 };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', invalidMaxDto, mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating maxParticipants above 10', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      const invalidMaxDto: UpdateLunchPostDto = { maxParticipants: 11 };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', invalidMaxDto, mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not assign unknown fields from dto (mass assignment protection)', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockImplementation(async (p) => p as LunchPost);

      // Act - pass dto with an unknown field
      const dtoWithExtra = { menu: '짜장면', status: LunchPostStatus.CLOSED } as UpdateLunchPostDto;
      await service.update('post-uuid-1234', dtoWithExtra, mockAuthor.id);

      // Assert - status should remain OPEN (not overwritten by dto)
      expect(lunchPostRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LunchPostStatus.OPEN,
        }),
      );
    });

    it('should allow updating date to a future date', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      const futureDate = getTomorrowDate();
      lunchPostRepository.save.mockResolvedValue({ ...mockPost, date: futureDate });
      const futureDateDto: UpdateLunchPostDto = { date: futureDate };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', futureDateDto, mockAuthor.id),
      ).resolves.toBeDefined();
    });

    it('should allow updating time to a valid time', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue({ ...mockPost, time: '13:30' });
      const validTimeDto: UpdateLunchPostDto = { time: '13:30' };

      // Act & Assert
      await expect(
        service.update('post-uuid-1234', validTimeDto, mockAuthor.id),
      ).resolves.toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // remove (soft delete)
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('should soft-delete the post by setting isDeleted to true', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue({ ...mockPost, isDeleted: true });

      // Act
      await service.remove('post-uuid-1234', mockAuthor.id);

      // Assert
      expect(lunchPostRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isDeleted: true,
        }),
      );
    });

    it('should throw ForbiddenException when non-author tries to delete', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);

      // Act & Assert
      await expect(
        service.remove('post-uuid-1234', mockOtherMember.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.remove('non-existent-id', mockAuthor.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when post is already soft-deleted', async () => {
      // Arrange
      const deletedPost = createMockLunchPost({ isDeleted: true });
      lunchPostRepository.findOne.mockResolvedValue(deletedPost);

      // Act & Assert
      await expect(
        service.remove('post-uuid-1234', mockAuthor.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // close
  // ─────────────────────────────────────────────
  describe('close', () => {
    it('should change post status to CLOSED', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue(closedPost);

      // Act
      const result = await service.close('post-uuid-1234', mockAuthor.id);

      // Assert
      expect(result.status).toBe(LunchPostStatus.CLOSED);
    });

    it('should throw ForbiddenException when non-author tries to close', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);

      // Act & Assert
      await expect(
        service.close('post-uuid-1234', mockOtherMember.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when post is already closed', async () => {
      // Arrange
      const closedPost = createMockLunchPost({ status: LunchPostStatus.CLOSED });
      lunchPostRepository.findOne.mockResolvedValue(closedPost);

      // Act & Assert
      await expect(
        service.close('post-uuid-1234', mockAuthor.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      lunchPostRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.close('non-existent-id', mockAuthor.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call lunchPostRepository.save with status CLOSED', async () => {
      // Arrange
      const mockPost = createMockLunchPost();
      lunchPostRepository.findOne.mockResolvedValue(mockPost);
      lunchPostRepository.save.mockResolvedValue({
        ...mockPost,
        status: LunchPostStatus.CLOSED,
      });

      // Act
      await service.close('post-uuid-1234', mockAuthor.id);

      // Assert
      expect(lunchPostRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LunchPostStatus.CLOSED,
        }),
      );
    });
  });
});
