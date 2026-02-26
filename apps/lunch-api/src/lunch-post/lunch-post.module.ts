import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LunchPostController } from './lunch-post.controller';
import { LunchPostService } from './lunch-post.service';
import { LunchPost } from '../entities/lunch-post.entity';
import { Participation } from '../entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LunchPost, Participation])],
  controllers: [LunchPostController],
  providers: [LunchPostService],
})
export class LunchPostModule {}
