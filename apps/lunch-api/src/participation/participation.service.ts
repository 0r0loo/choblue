import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Participation } from '../entities/participation.entity';
import { LunchPost, LunchPostStatus } from '../entities/lunch-post.entity';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    @InjectRepository(LunchPost)
    private readonly lunchPostRepository: Repository<LunchPost>,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  async participate(
    postId: string,
    memberId: string,
    workspaceId: string,
  ): Promise<Participation> {
    return this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(LunchPost, {
        where: { id: postId },
      });

      if (!post || post.isDeleted) {
        throw new NotFoundException('모집글을 찾을 수 없습니다.');
      }

      if (post.workspaceId !== workspaceId) {
        throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
      }

      if (post.status === LunchPostStatus.CLOSED) {
        throw new BadRequestException('이미 마감된 모집글입니다.');
      }

      const existing = await manager.findOne(Participation, {
        where: { lunchPostId: postId, memberId },
      });

      if (existing) {
        throw new BadRequestException('이미 참여 중인 모집글입니다.');
      }

      const currentCount = await manager.count(Participation, {
        where: { lunchPostId: postId },
      });

      if (currentCount >= post.maxParticipants) {
        throw new BadRequestException('참여 인원이 가득 찼습니다.');
      }

      const participation = manager.create(Participation, {
        lunchPostId: postId,
        memberId,
      });

      const saved = await manager.save(participation);

      // Auto-close when participation fills maxParticipants
      if (currentCount + 1 >= post.maxParticipants) {
        post.status = LunchPostStatus.CLOSED;
        await manager.save(post);
      }

      return saved;
    });
  }

  async cancelParticipation(
    postId: string,
    memberId: string,
    workspaceId: string,
  ): Promise<void> {
    const post = await this.lunchPostRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }

    if (post.workspaceId !== workspaceId) {
      throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
    }

    if (post.status === LunchPostStatus.CLOSED) {
      throw new BadRequestException('마감된 모집글의 참여는 취소할 수 없습니다.');
    }

    if (post.authorId === memberId) {
      throw new BadRequestException('모집자는 참여를 취소할 수 없습니다.');
    }

    const participation = await this.participationRepository.findOne({
      where: { lunchPostId: postId, memberId },
    });

    if (!participation) {
      throw new NotFoundException('참여 내역을 찾을 수 없습니다.');
    }

    await this.participationRepository.delete(participation.id);
  }
}
