import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { Member } from './member.entity';
import { Participation } from './participation.entity';
import { Review } from './review.entity';

export enum LunchPostStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity()
export class LunchPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  menu!: string;

  @Column({ type: 'varchar', nullable: true })
  restaurant!: string | null;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'time' })
  time!: string;

  @Column({ type: 'int' })
  maxParticipants!: number;

  @Column({ type: 'enum', enum: LunchPostStatus, default: LunchPostStatus.OPEN })
  status!: LunchPostStatus;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @Column({ type: 'uuid' })
  authorId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.lunchPosts, { onDelete: 'CASCADE' })
  workspace!: Workspace;

  @ManyToOne(() => Member, (member) => member.lunchPosts, { onDelete: 'CASCADE' })
  author!: Member;

  @OneToMany(() => Participation, (participation) => participation.lunchPost)
  participations!: Participation[];

  @OneToMany(() => Review, (review) => review.lunchPost)
  reviews!: Review[];
}
