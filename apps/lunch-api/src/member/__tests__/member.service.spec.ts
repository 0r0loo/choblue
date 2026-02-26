import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberService } from '../member.service';
import { Member, MemberRole } from '../../entities/member.entity';
import { Workspace } from '../../entities/workspace.entity';

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    memberRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepository,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // updateNickname
  // ─────────────────────────────────────────────
  describe('updateNickname', () => {
    it('should update the nickname of the member', async () => {
      // Arrange
      const updatedMember = { ...mockMember, nickname: '새닉네임' };
      memberRepository.findOne.mockResolvedValue(mockMember);
      memberRepository.save.mockResolvedValue(updatedMember);

      // Act
      const result = await service.updateNickname('member-uuid-1234', '새닉네임');

      // Assert
      expect(result.nickname).toBe('새닉네임');
    });

    it('should throw NotFoundException when member does not exist', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateNickname('non-existent-id', '새닉네임'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when nickname is shorter than 2 characters', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);

      // Act & Assert
      await expect(
        service.updateNickname('member-uuid-1234', 'A'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when nickname is longer than 10 characters', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);

      // Act & Assert
      await expect(
        service.updateNickname('member-uuid-1234', 'A'.repeat(11)),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept nickname with exactly 2 characters (lower boundary)', async () => {
      // Arrange
      const updatedMember = { ...mockMember, nickname: 'AB' };
      memberRepository.findOne.mockResolvedValue(mockMember);
      memberRepository.save.mockResolvedValue(updatedMember);

      // Act & Assert
      await expect(
        service.updateNickname('member-uuid-1234', 'AB'),
      ).resolves.toBeDefined();
    });

    it('should accept nickname with exactly 10 characters (upper boundary)', async () => {
      // Arrange
      const tenCharNickname = 'A'.repeat(10);
      const updatedMember = { ...mockMember, nickname: tenCharNickname };
      memberRepository.findOne.mockResolvedValue(mockMember);
      memberRepository.save.mockResolvedValue(updatedMember);

      // Act & Assert
      await expect(
        service.updateNickname('member-uuid-1234', tenCharNickname),
      ).resolves.toBeDefined();
    });

    it('should call memberRepository.save with the updated member', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      memberRepository.save.mockResolvedValue({ ...mockMember, nickname: '새닉네임' });

      // Act
      await service.updateNickname('member-uuid-1234', '새닉네임');

      // Assert
      expect(memberRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: '새닉네임',
        }),
      );
    });

    it('should query memberRepository by id', async () => {
      // Arrange
      const memberId = 'member-uuid-1234';
      memberRepository.findOne.mockResolvedValue(mockMember);
      memberRepository.save.mockResolvedValue({ ...mockMember, nickname: '새닉네임' });

      // Act
      await service.updateNickname(memberId, '새닉네임');

      // Assert
      expect(memberRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: memberId },
        }),
      );
    });
  });
});
