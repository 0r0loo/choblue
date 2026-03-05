import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentWorkspace } from '../current-workspace.decorator';
import { Workspace } from '../../entities/workspace.entity';

describe('CurrentWorkspace Decorator', () => {
  const mockWorkspace: Workspace = {
    id: 'workspace-uuid-1234',
    name: 'Test Workspace',
    slug: 'test-workspace',
    inviteCode: 'INVITE123',
    adminToken: 'admin-token-xyz',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    members: [],
    lunchPosts: [],
    restaurants: [],
  };

  function getParamDecoratorFactory() {
    class TestController {
      test(@CurrentWorkspace() _workspace: Workspace) {}
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

  it('should extract workspace from request.workspace', () => {
    // Arrange
    const factory = getParamDecoratorFactory();
    const context = createMockExecutionContext({ workspace: mockWorkspace });

    // Act
    const result = factory(undefined, context);

    // Assert
    expect(result).toBe(mockWorkspace);
  });

  it('should return undefined when request.workspace is not set', () => {
    // Arrange
    const factory = getParamDecoratorFactory();
    const context = createMockExecutionContext({});

    // Act
    const result = factory(undefined, context);

    // Assert
    expect(result).toBeUndefined();
  });
});