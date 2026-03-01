import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from '../member.controller';
import { MemberService } from '../member.service';
import { Member, MemberRole } from '../../entities/member.entity';
import { Workspace } from '../../entities/workspace.entity';
import { CookieGuard } from '../../auth/cookie.guard';
import { UpdateMemberDto } from '../dto/update-member.dto';

describe('MemberController', () => {
  let controller: MemberController;
  let memberService: {
    updateNickname: ReturnType<typeof vi.fn>;
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
    reviews: [],
  };

  beforeEach(async () => {
    memberService = {
      updateNickname: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: memberService,
        },
      ],
    })
      .overrideGuard(CookieGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MemberController>(MemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // PATCH /members/me
  // ─────────────────────────────────────────────
  describe('PATCH /members/me (updateNickname)', () => {
    const updateDto: UpdateMemberDto = {
      nickname: '새닉네임',
    };

    it('should call memberService.updateNickname with memberId and nickname', async () => {
      // Arrange
      const updatedMember = { ...mockMember, nickname: '새닉네임' };
      memberService.updateNickname.mockResolvedValue(updatedMember);

      // Act
      await controller.updateNickname(updateDto, mockMember);

      // Assert
      expect(memberService.updateNickname).toHaveBeenCalledWith(
        mockMember.id,
        updateDto.nickname,
      );
    });

    it('should return the updated member', async () => {
      // Arrange
      const updatedMember = { ...mockMember, nickname: '새닉네임' };
      memberService.updateNickname.mockResolvedValue(updatedMember);

      // Act
      const result = await controller.updateNickname(updateDto, mockMember);

      // Assert
      expect(result.nickname).toBe('새닉네임');
    });

    it('should have CookieGuard applied', () => {
      // Arrange & Act
      const guards = Reflect.getMetadata(
        '__guards__',
        MemberController.prototype.updateNickname,
      );

      // Assert
      expect(guards).toBeDefined();
      expect(guards).toContain(CookieGuard);
    });
  });
});
