import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentMember } from '../current-member.decorator';
import { Member, MemberRole } from '../../entities/member.entity';

describe('CurrentMember Decorator', () => {
  const mockMember: Member = {
    id: 'member-uuid-5678',
    nickname: 'alice',
    cookieToken: 'cookie-token-abc',
    role: MemberRole.MEMBER,
    workspaceId: 'workspace-uuid-1234',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as Member;

  function getParamDecoratorFactory() {
    class TestController {
      test(@CurrentMember() _member: Member) {}
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );

    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  }

  function createMockExecutionContext(requestData: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => requestData,
      }),
    } as unknown as ExecutionContext;
  }

  it('should extract member from request.member', () => {
    // Arrange
    const factory = getParamDecoratorFactory();
    const context = createMockExecutionContext({ member: mockMember });

    // Act
    const result = factory(undefined, context);

    // Assert
    expect(result).toBe(mockMember);
  });

  it('should return undefined when request.member is not set', () => {
    // Arrange
    const factory = getParamDecoratorFactory();
    const context = createMockExecutionContext({});

    // Act
    const result = factory(undefined, context);

    // Assert
    expect(result).toBeUndefined();
  });
});
