import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { LunchPost, LunchPostStatus } from '../entities/lunch-post.entity';
import { Participation } from '../entities/participation.entity';
import { CreateLunchPostDto } from './dto/create-lunch-post.dto';
import { UpdateLunchPostDto } from './dto/update-lunch-post.dto';

const VALID_TIMES = new Set([
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
]);

@Injectable()
export class LunchPostService {
  constructor(
    @InjectRepository(LunchPost)
    private readonly lunchPostRepository: Repository<LunchPost>,
    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
    @Inject(DataSource)
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateLunchPostDto,
    authorId: string,
    workspaceId: string,
  ): Promise<LunchPost> {
    this.validateDate(dto.date);
    this.validateTime(dto.time);
    this.validateMaxParticipants(dto.maxParticipants);

    return this.dataSource.transaction(async (manager) => {
      const post = manager.create(LunchPost, {
        menu: dto.menu,
        restaurant: dto.restaurant,
        date: dto.date,
        time: dto.time,
        maxParticipants: dto.maxParticipants,
        authorId,
        workspaceId,
      });
      const savedPost = await manager.save(post);

      const participation = manager.create(Participation, {
        lunchPostId: savedPost.id,
        memberId: authorId,
      });
      await manager.save(participation);

      return savedPost;
    });
  }

  async findByDate(
    workspaceId: string,
    date: string,
  ): Promise<LunchPost[]> {
    const resolvedDate = this.resolveDate(date);

    return this.lunchPostRepository.find({
      where: {
        workspaceId,
        date: resolvedDate,
        isDeleted: false,
      },
      relations: {
        author: true,
        participations: {
          member: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCalendarData(
    workspaceId: string,
    month: string,
  ): Promise<Record<string, number>> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('month는 YYYY-MM 형식이어야 합니다.');
    }

    const posts = await this.lunchPostRepository.find({
      where: {
        workspaceId,
        date: Like(`${month}%`),
        isDeleted: false,
      },
      select: ['date'],
    });

    const result: Record<string, number> = {};
    for (const post of posts) {
      const dateStr = post.date;
      result[dateStr] = (result[dateStr] || 0) + 1;
    }
    return result;
  }

  async findOne(
    id: string,
    workspaceId: string,
  ): Promise<LunchPost> {
    const post = await this.lunchPostRepository.findOne({
      where: { id },
      relations: {
        author: true,
        participations: {
          member: true,
        },
      },
    });

    if (!post || post.isDeleted) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }

    if (post.workspaceId !== workspaceId) {
      throw new ForbiddenException('해당 워크스페이스의 모집글이 아닙니다.');
    }

    return post;
  }

  async update(
    id: string,
    dto: UpdateLunchPostDto,
    memberId: string,
  ): Promise<LunchPost> {
    const post = await this.findPostForAuthor(id, memberId, '수정');

    if (post.status === LunchPostStatus.CLOSED) {
      throw new BadRequestException('마감된 모집글은 수정할 수 없습니다.');
    }

    // Validate changed fields
    if (dto.date !== undefined) this.validateDate(dto.date);
    if (dto.time !== undefined) this.validateTime(dto.time);
    if (dto.maxParticipants !== undefined) this.validateMaxParticipants(dto.maxParticipants);

    // Explicit field assignment (no Object.assign)
    if (dto.menu !== undefined) post.menu = dto.menu;
    if (dto.restaurant !== undefined) post.restaurant = dto.restaurant;
    if (dto.date !== undefined) post.date = dto.date;
    if (dto.time !== undefined) post.time = dto.time;
    if (dto.maxParticipants !== undefined) post.maxParticipants = dto.maxParticipants;

    return this.lunchPostRepository.save(post);
  }

  async remove(
    id: string,
    memberId: string,
  ): Promise<void> {
    const post = await this.findPostForAuthor(id, memberId, '삭제');

    post.isDeleted = true;
    await this.lunchPostRepository.save(post);
  }

  async close(
    id: string,
    memberId: string,
  ): Promise<LunchPost> {
    const post = await this.findPostForAuthor(id, memberId, '마감');

    if (post.status === LunchPostStatus.CLOSED) {
      throw new BadRequestException('이미 마감된 모집글입니다.');
    }

    post.status = LunchPostStatus.CLOSED;
    return this.lunchPostRepository.save(post);
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  private async findPostForAuthor(
    id: string,
    memberId: string,
    action: string,
  ): Promise<LunchPost> {
    const post = await this.lunchPostRepository.findOne({
      where: { id },
    });

    if (!post || post.isDeleted) {
      throw new NotFoundException('모집글을 찾을 수 없습니다.');
    }

    if (post.authorId !== memberId) {
      throw new ForbiddenException(`작성자만 ${action}할 수 있습니다.`);
    }

    return post;
  }

  private getTodayKST(): string {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstNow = new Date(now.getTime() + kstOffset);
    return kstNow.toISOString().split('T')[0];
  }

  private resolveDate(date: string): string {
    if (!date) {
      return this.getTodayKST();
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date는 YYYY-MM-DD 형식이어야 합니다.');
    }

    return date;
  }

  private validateDate(date: string): void {
    const todayStr = this.getTodayKST();
    if (date < todayStr) {
      throw new BadRequestException('과거 날짜에는 모집글을 작성할 수 없습니다.');
    }
  }

  private validateTime(time: string): void {
    if (!VALID_TIMES.has(time)) {
      throw new BadRequestException(
        '시간은 11:00~14:00 사이 30분 단위만 허용됩니다.',
      );
    }
  }

  private validateMaxParticipants(max: number): void {
    if (max < 2 || max > 10) {
      throw new BadRequestException(
        '최대 참여 인원은 2~10명이어야 합니다.',
      );
    }
  }
}
