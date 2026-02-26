import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async updateNickname(
    memberId: string,
    nickname: string,
  ): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    if (nickname.length < 2 || nickname.length > 10) {
      throw new BadRequestException('닉네임은 2~10자여야 합니다.');
    }

    member.nickname = nickname;
    return this.memberRepository.save(member);
  }
}
