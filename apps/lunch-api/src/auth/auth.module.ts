import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../entities/member.entity';
import { CookieGuard } from './cookie.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [CookieGuard],
  exports: [CookieGuard, TypeOrmModule],
})
export class AuthModule {}
