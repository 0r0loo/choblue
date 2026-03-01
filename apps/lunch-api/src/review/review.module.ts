import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from '../entities/review.entity';
import { LunchPost } from '../entities/lunch-post.entity';
import { Participation } from '../entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, LunchPost, Participation])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
