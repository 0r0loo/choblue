import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { AUTH_COOKIE_NAME } from './constants';
import { AuthenticatedRequest } from './types';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    @Optional()
    @Inject(getRepositoryToken(Member))
    private readonly memberRepository: Repository<Member>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const token: string | undefined = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Missing authentication cookie');
    }

    const member = await this.memberRepository.findOne({
      where: { cookieToken: token },
      relations: { workspace: true },
    });

    if (!member) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    request.member = member;
    request.workspace = member.workspace;

    return true;
  }
}
