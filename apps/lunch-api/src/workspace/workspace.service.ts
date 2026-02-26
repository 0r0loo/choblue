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
        nickname: '관리자',
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
  ): Promise<{ name: string; description: string | null; memberCount: number }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { inviteCode: code },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId: workspace.id },
    });

    return {
      name: workspace.name,
      description: workspace.description,
      memberCount,
    };
  }

  async join(
    workspaceId: string,
    dto: JoinWorkspaceDto,
  ): Promise<{ member: Member; cookieToken: string }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.inviteCode !== dto.inviteCode) {
      throw new BadRequestException('Invalid invite code');
    }

    if (dto.nickname.length < 2 || dto.nickname.length > 10) {
      throw new BadRequestException(
        'Nickname must be between 2 and 10 characters',
      );
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId },
    });

    if (memberCount >= 50) {
      throw new BadRequestException('Workspace has reached maximum capacity');
    }

    const cookieToken = randomUUID();
    const member = this.memberRepository.create({
      nickname: dto.nickname,
      cookieToken,
      role: MemberRole.MEMBER,
      workspaceId,
    });
    const savedMember = await this.memberRepository.save(member);

    return { member: savedMember, cookieToken };
  }

  async findOne(
    workspaceId: string,
  ): Promise<{
    workspace: Omit<Workspace, 'inviteCode' | 'adminToken'>;
    memberCount: number;
  }> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const memberCount = await this.memberRepository.count({
      where: { workspaceId },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { inviteCode, adminToken, ...safeWorkspace } = workspace;

    return { workspace: safeWorkspace, memberCount };
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
