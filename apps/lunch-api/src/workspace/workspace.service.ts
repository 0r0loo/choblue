import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Workspace } from '../entities/workspace.entity';
import { Member, MemberRole } from '../entities/member.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JoinWorkspaceDto } from './dto/join-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateWorkspaceDto,
  ): Promise<{ workspace: Workspace; member: Member; cookieToken: string }> {
    if (dto.name.length < 2 || dto.name.length > 30) {
      throw new BadRequestException(
        'Workspace name must be between 2 and 30 characters',
      );
    }

    const slug = this.generateSlug(dto.name);
    const inviteCode = randomUUID();
    const adminToken = randomUUID();
    const cookieToken = randomUUID();

    return this.dataSource.transaction(async (manager) => {
      const workspace = manager.create(Workspace, {
        name: dto.name,
        slug,
        inviteCode,
        adminToken,
        description: dto.description ?? null,
      });
      const savedWorkspace = await manager.save(workspace);

      const member = manager.create(Member, {
        nickname: dto.nickname,
        cookieToken,
        role: MemberRole.ADMIN,
        workspaceId: savedWorkspace.id,
      });
      const savedMember = await manager.save(member);

      return { workspace: savedWorkspace, member: savedMember, cookieToken };
    });
  }

  async findByInviteCode(
    code: string,
    cookieToken?: string,
  ): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    memberCount: number;
    currentMember?: { isMember: true; slug: string };
  }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { inviteCode: code },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId: workspace.id },
    });

    const result: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      memberCount: number;
      currentMember?: { isMember: true; slug: string };
    } = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      memberCount,
    };

    if (cookieToken) {
      const existingMember = await this.memberRepository.findOne({
        where: { cookieToken, workspaceId: workspace.id },
      });
      if (existingMember) {
        result.currentMember = { isMember: true, slug: workspace.slug };
      }
    }

    return result;
  }

  async join(
    workspaceId: string,
    dto: JoinWorkspaceDto,
    cookieToken?: string,
  ): Promise<{
    member: Member;
    cookieToken: string;
    workspaceSlug: string;
    alreadyMember: boolean;
  }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.inviteCode !== dto.inviteCode) {
      throw new BadRequestException('Invalid invite code');
    }

    if (cookieToken) {
      const existingMember = await this.memberRepository.findOne({
        where: { cookieToken, workspaceId },
      });
      if (existingMember) {
        return {
          member: existingMember,
          cookieToken: existingMember.cookieToken,
          workspaceSlug: workspace.slug,
          alreadyMember: true,
        };
      }
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId },
    });

    if (memberCount >= 50) {
      throw new BadRequestException('Workspace has reached maximum capacity');
    }

    const newCookieToken = randomUUID();
    const member = this.memberRepository.create({
      nickname: dto.nickname,
      cookieToken: newCookieToken,
      role: MemberRole.MEMBER,
      workspaceId,
    });
    const savedMember = await this.memberRepository.save(member);

    return {
      member: savedMember,
      cookieToken: newCookieToken,
      workspaceSlug: workspace.slug,
      alreadyMember: false,
    };
  }

  async findOne(workspaceId: string, member: Member) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId },
    });

    const { adminToken, ...rest } = workspace;
    if (member.role !== MemberRole.ADMIN) {
      const { inviteCode, ...safeWorkspace } = rest;
      return { workspace: safeWorkspace, memberCount };
    }

    return { workspace: rest, memberCount };
  }

  async update(
    workspaceId: string,
    dto: UpdateWorkspaceDto,
    member: Member,
  ): Promise<Workspace> {
    if (member.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can update workspace');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (dto.name !== undefined) {
      workspace.name = dto.name;
    }
    if (dto.description !== undefined) {
      workspace.description = dto.description;
    }

    return this.workspaceRepository.save(workspace);
  }

  async regenerateInviteCode(
    workspaceId: string,
    member: Member,
  ): Promise<{ inviteCode: string }> {
    if (member.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can regenerate invite code');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    workspace.inviteCode = randomUUID();
    await this.workspaceRepository.save(workspace);

    return { inviteCode: workspace.inviteCode };
  }

  async leaveWorkspace(workspaceId: string, member: Member): Promise<void> {
    if (member.role === MemberRole.ADMIN) {
      throw new ForbiddenException(
        '관리자는 워크스페이스를 탈퇴할 수 없습니다.',
      );
    }

    await this.memberRepository.delete({ id: member.id, workspaceId });
  }

  async findMembers(workspaceId: string): Promise<Member[]> {
    return this.memberRepository.find({
      where: { workspaceId },
      order: { createdAt: 'ASC' },
    });
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const suffix = randomUUID().slice(0, 4);
    return `${base}-${suffix}`;
  }
}
