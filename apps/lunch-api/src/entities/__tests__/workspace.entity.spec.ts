import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Workspace } from '../workspace.entity';

describe('Workspace Entity', () => {
  describe('instance creation', () => {
    it('should create a Workspace instance', () => {
      const workspace = new Workspace();

      expect(workspace).toBeInstanceOf(Workspace);
    });
  });

  describe('field assignment', () => {
    it('should accept all required fields', () => {
      const workspace = new Workspace();
      workspace.id = '550e8400-e29b-41d4-a716-446655440000';
      workspace.name = 'Engineering Team';
      workspace.slug = 'engineering-team';
      workspace.inviteCode = 'ABC123';
      workspace.adminToken = 'admin-token-xyz';

      expect(workspace.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(workspace.name).toBe('Engineering Team');
      expect(workspace.slug).toBe('engineering-team');
      expect(workspace.inviteCode).toBe('ABC123');
      expect(workspace.adminToken).toBe('admin-token-xyz');
    });

    it('should accept nullable description field', () => {
      const workspace = new Workspace();
      workspace.description = null as unknown as string;

      expect(workspace.description).toBeNull();
    });

    it('should accept description when provided', () => {
      const workspace = new Workspace();
      workspace.description = 'A workspace for the engineering team';

      expect(workspace.description).toBe('A workspace for the engineering team');
    });
  });

  describe('TypeORM metadata', () => {
    it('should be registered as a TypeORM entity', () => {
      const tables = getMetadataArgsStorage().tables;
      const workspaceTable = tables.find((t) => t.target === Workspace);

      expect(workspaceTable).toBeDefined();
    });

    it('should have id as primary generated uuid column', () => {
      const generatedColumns = getMetadataArgsStorage().generations;
      const idGeneration = generatedColumns.find(
        (g) => g.target === Workspace && g.propertyName === 'id',
      );

      expect(idGeneration).toBeDefined();
      expect(idGeneration?.strategy).toBe('uuid');
    });

    it('should have slug as unique column', () => {
      const columns = getMetadataArgsStorage().columns;
      const slugColumn = columns.find(
        (c) => c.target === Workspace && c.propertyName === 'slug',
      );

      expect(slugColumn).toBeDefined();
      expect(slugColumn?.options.unique).toBe(true);
    });

    it('should have inviteCode as unique column', () => {
      const columns = getMetadataArgsStorage().columns;
      const inviteCodeColumn = columns.find(
        (c) => c.target === Workspace && c.propertyName === 'inviteCode',
      );

      expect(inviteCodeColumn).toBeDefined();
      expect(inviteCodeColumn?.options.unique).toBe(true);
    });

    it('should have description as nullable column', () => {
      const columns = getMetadataArgsStorage().columns;
      const descriptionColumn = columns.find(
        (c) => c.target === Workspace && c.propertyName === 'description',
      );

      expect(descriptionColumn).toBeDefined();
      expect(descriptionColumn?.options.nullable).toBe(true);
    });

    it('should have createdAt and updatedAt timestamp columns', () => {
      const columns = getMetadataArgsStorage().columns;
      const createdAt = columns.find(
        (c) => c.target === Workspace && c.propertyName === 'createdAt',
      );
      const updatedAt = columns.find(
        (c) => c.target === Workspace && c.propertyName === 'updatedAt',
      );

      expect(createdAt).toBeDefined();
      expect(updatedAt).toBeDefined();
    });
  });

  describe('relations', () => {
    it('should have OneToMany relation to members', () => {
      const relations = getMetadataArgsStorage().relations;
      const membersRelation = relations.find(
        (r) => r.target === Workspace && r.propertyName === 'members',
      );

      expect(membersRelation).toBeDefined();
      expect(membersRelation?.relationType).toBe('one-to-many');
    });

    it('should have OneToMany relation to lunchPosts', () => {
      const relations = getMetadataArgsStorage().relations;
      const lunchPostsRelation = relations.find(
        (r) => r.target === Workspace && r.propertyName === 'lunchPosts',
      );

      expect(lunchPostsRelation).toBeDefined();
      expect(lunchPostsRelation?.relationType).toBe('one-to-many');
    });
  });
});
