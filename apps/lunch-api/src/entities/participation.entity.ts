import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { LunchPost } from './lunch-post.entity';
import { Member } from './member.entity';

@Entity()
@Unique(['lunchPostId', 'memberId'])
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  lunchPostId!: string;

  @Column({ type: 'uuid' })
  memberId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => LunchPost, (lunchPost) => lunchPost.participations, { onDelete: 'CASCADE' })
  lunchPost!: LunchPost;

  @ManyToOne(() => Member, (member) => member.participations, { onDelete: 'CASCADE' })
  member!: Member;
}
