import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { LunchPost } from './lunch-post.entity';
import { Member } from './member.entity';

@Entity()
@Unique(['lunchPostId', 'memberId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  lunchPostId!: string;

  @Column({ type: 'uuid' })
  memberId!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  content!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => LunchPost, (lunchPost) => lunchPost.reviews, { onDelete: 'CASCADE' })
  lunchPost!: LunchPost;

  @ManyToOne(() => Member, (member) => member.reviews, { onDelete: 'CASCADE' })
  member!: Member;
}
