import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { MenuItem } from './menu-item.entity';
import { Review } from './review.entity';

@Entity()
@Unique(['name', 'workspaceId'])
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'uuid' })
  workspaceId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace!: Workspace;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems!: MenuItem[];

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews!: Review[];
}
