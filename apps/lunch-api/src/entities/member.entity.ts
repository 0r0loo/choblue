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
import { LunchPost } from './lunch-post.entity';
import { Participation } from './participation.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  nickname!: string;

  @Column({ type: 'varchar', unique: true })
  cookieToken!: string;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role!: MemberRole;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, { onDelete: 'CASCADE' })
  workspace!: Workspace;

  @OneToMany(() => LunchPost, (lunchPost) => lunchPost.author)
  lunchPosts!: LunchPost[];

  @OneToMany(() => Participation, (participation) => participation.member)
  participations!: Participation[];
}
