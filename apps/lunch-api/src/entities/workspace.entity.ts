import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Member } from './member.entity';
import { LunchPost } from './lunch-post.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'varchar', unique: true })
  inviteCode!: string;

  @Column({ type: 'varchar' })
  adminToken!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Member, (member) => member.workspace)
  members!: Member[];

  @OneToMany(() => LunchPost, (lunchPost) => lunchPost.workspace)
  lunchPosts!: LunchPost[];

  @OneToMany(() => Restaurant, (restaurant) => restaurant.workspace)
  restaurants!: Restaurant[];
}
