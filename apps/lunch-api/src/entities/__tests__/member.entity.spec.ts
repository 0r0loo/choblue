import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Member, MemberRole } from '../member.entity';

describe('Member Entity', () => {
  describe('instance creation', () => {
    it('should create a Member instance', () => {
      const member = new Member();

      expect(member).toBeInstanceOf(Member);
    });
  });

  describe('MemberRole enum', () => {
    it('should have ADMIN value', () => {
      expect(MemberRole.ADMIN).toBe('admin');
    });

    it('should have MEMBER value', () => {
      expect(MemberRole.MEMBER).toBe('member');
    });
  });

  describe('field assignment', () => {
    it('should accept all required fields', () => {
      const member = new Member();
      member.id = '550e8400-e29b-41d4-a716-446655440000';
      member.nickname = 'alice';
      member.cookieToken = 'cookie-token-abc123';
      member.role = MemberRole.MEMBER;
      member.workspaceId = '660e8400-e29b-41d4-a716-446655440000';

      expect(member.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(member.nickname).toBe('alice');
      expect(member.cookieToken).toBe('cookie-token-abc123');
      expect(member.role).toBe('member');
      expect(member.workspaceId).toBe('660e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept admin role', () => {
      const member = new Member();
      member.role = MemberRole.ADMIN;

      expect(member.role).toBe('admin');
    });
  });

  describe('default values', () => {
    it('should have default role of member', () => {
      const columns = getMetadataArgsStorage().columns;
      const roleColumn = columns.find(
        (c) => c.target === Member && c.propertyName === 'role',
      );

      expect(roleColumn).toBeDefined();
      expect(roleColumn?.options.default).toBe(MemberRole.MEMBER);
    });
  });

  describe('TypeORM metadata', () => {
    it('should be registered as a TypeORM entity', () => {
      const tables = getMetadataArgsStorage().tables;
      const memberTable = tables.find((t) => t.target === Member);

      expect(memberTable).toBeDefined();
    });

    it('should have id as primary generated uuid column', () => {
      const generatedColumns = getMetadataArgsStorage().generations;
      const idGeneration = generatedColumns.find(
        (g) => g.target === Member && g.propertyName === 'id',
      );

      expect(idGeneration).toBeDefined();
      expect(idGeneration?.strategy).toBe('uuid');
    });

    it('should have cookieToken as unique column', () => {
      const columns = getMetadataArgsStorage().columns;
      const cookieTokenColumn = columns.find(
        (c) => c.target === Member && c.propertyName === 'cookieToken',
      );

      expect(cookieTokenColumn).toBeDefined();
      expect(cookieTokenColumn?.options.unique).toBe(true);
    });

    it('should have role as enum column', () => {
      const columns = getMetadataArgsStorage().columns;
      const roleColumn = columns.find(
        (c) => c.target === Member && c.propertyName === 'role',
      );

      expect(roleColumn).toBeDefined();
      expect(roleColumn?.options.type).toBe('enum');
      expect(roleColumn?.options.enum).toBe(MemberRole);
    });

    it('should have createdAt and updatedAt timestamp columns', () => {
      const columns = getMetadataArgsStorage().columns;
      const createdAt = columns.find(
        (c) => c.target === Member && c.propertyName === 'createdAt',
      );
      const updatedAt = columns.find(
        (c) => c.target === Member && c.propertyName === 'updatedAt',
      );

      expect(createdAt).toBeDefined();
      expect(updatedAt).toBeDefined();
    });
  });

  describe('relations', () => {
    it('should have ManyToOne relation to workspace', () => {
      const relations = getMetadataArgsStorage().relations;
      const workspaceRelation = relations.find(
        (r) => r.target === Member && r.propertyName === 'workspace',
      );

      expect(workspaceRelation).toBeDefined();
      expect(workspaceRelation?.relationType).toBe('many-to-one');
    });

    it('should have OneToMany relation to lunchPosts', () => {
      const relations = getMetadataArgsStorage().relations;
      const lunchPostsRelation = relations.find(
        (r) => r.target === Member && r.propertyName === 'lunchPosts',
      );

      expect(lunchPostsRelation).toBeDefined();
      expect(lunchPostsRelation?.relationType).toBe('one-to-many');
    });

    it('should have OneToMany relation to participations', () => {
      const relations = getMetadataArgsStorage().relations;
      const participationsRelation = relations.find(
        (r) => r.target === Member && r.propertyName === 'participations',
      );

      expect(participationsRelation).toBeDefined();
      expect(participationsRelation?.relationType).toBe('one-to-many');
    });
  });
});
