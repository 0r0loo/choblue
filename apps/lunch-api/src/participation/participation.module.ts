import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { Participation } from '../entities/participation.entity';
import { LunchPost } from '../entities/lunch-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participation, LunchPost])],
  controllers: [ParticipationController],
  providers: [ParticipationService],
})
export class ParticipationModule {}
