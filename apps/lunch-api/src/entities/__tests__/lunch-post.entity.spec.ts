import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { LunchPost, LunchPostStatus } from '../lunch-post.entity';

describe('LunchPost Entity', () => {
  describe('instance creation', () => {
    it('should create a LunchPost instance', () => {
      const lunchPost = new LunchPost();

      expect(lunchPost).toBeInstanceOf(LunchPost);
    });
  });

  describe('LunchPostStatus enum', () => {
    it('should have OPEN value', () => {
      expect(LunchPostStatus.OPEN).toBe('open');
    });

    it('should have CLOSED value', () => {
      expect(LunchPostStatus.CLOSED).toBe('closed');
    });
  });

  describe('field assignment', () => {
    it('should accept all required fields', () => {
      const lunchPost = new LunchPost();
      lunchPost.id = '550e8400-e29b-41d4-a716-446655440000';
      lunchPost.menu = 'Bibimbap';
      lunchPost.date = '2025-03-15';
      lunchPost.time = '12:00';
      lunchPost.maxParticipants = 4;
      lunchPost.status = LunchPostStatus.OPEN;
      lunchPost.isDeleted = false;
      lunchPost.workspaceId = '660e8400-e29b-41d4-a716-446655440000';
      lunchPost.authorId = '770e8400-e29b-41d4-a716-446655440000';

      expect(lunchPost.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(lunchPost.menu).toBe('Bibimbap');
      expect(lunchPost.date).toBe('2025-03-15');
      expect(lunchPost.time).toBe('12:00');
      expect(lunchPost.maxParticipants).toBe(4);
      expect(lunchPost.status).toBe('open');
      expect(lunchPost.isDeleted).toBe(false);
      expect(lunchPost.workspaceId).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(lunchPost.authorId).toBe('770e8400-e29b-41d4-a716-446655440000');
    });

    it('should accept nullable restaurant field', () => {
      const lunchPost = new LunchPost();
      lunchPost.restaurant = null as unknown as string;

      expect(lunchPost.restaurant).toBeNull();
    });

    it('should accept restaurant when provided', () => {
      const lunchPost = new LunchPost();
      lunchPost.restaurant = 'Korean BBQ House';

      expect(lunchPost.restaurant).toBe('Korean BBQ House');
    });
  });

  describe('default values', () => {
    it('should have default status of open', () => {
      const columns = getMetadataArgsStorage().columns;
      const statusColumn = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'status',
      );

      expect(statusColumn).toBeDefined();
      expect(statusColumn?.options.default).toBe(LunchPostStatus.OPEN);
    });

    it('should have default isDeleted of false', () => {
      const columns = getMetadataArgsStorage().columns;
      const isDeletedColumn = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'isDeleted',
      );

      expect(isDeletedColumn).toBeDefined();
      expect(isDeletedColumn?.options.default).toBe(false);
    });
  });

  describe('TypeORM metadata', () => {
    it('should be registered as a TypeORM entity', () => {
      const tables = getMetadataArgsStorage().tables;
      const lunchPostTable = tables.find((t) => t.target === LunchPost);

      expect(lunchPostTable).toBeDefined();
    });

    it('should have id as primary generated uuid column', () => {
      const generatedColumns = getMetadataArgsStorage().generations;
      const idGeneration = generatedColumns.find(
        (g) => g.target === LunchPost && g.propertyName === 'id',
      );

      expect(idGeneration).toBeDefined();
      expect(idGeneration?.strategy).toBe('uuid');
    });

    it('should have restaurant as nullable column', () => {
      const columns = getMetadataArgsStorage().columns;
      const restaurantColumn = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'restaurant',
      );

      expect(restaurantColumn).toBeDefined();
      expect(restaurantColumn?.options.nullable).toBe(true);
    });

    it('should have status as enum column', () => {
      const columns = getMetadataArgsStorage().columns;
      const statusColumn = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'status',
      );

      expect(statusColumn).toBeDefined();
      expect(statusColumn?.options.type).toBe('enum');
      expect(statusColumn?.options.enum).toBe(LunchPostStatus);
    });

    it('should have createdAt and updatedAt timestamp columns', () => {
      const columns = getMetadataArgsStorage().columns;
      const createdAt = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'createdAt',
      );
      const updatedAt = columns.find(
        (c) => c.target === LunchPost && c.propertyName === 'updatedAt',
      );

      expect(createdAt).toBeDefined();
      expect(updatedAt).toBeDefined();
    });
  });

  describe('relations', () => {
    it('should have ManyToOne relation to workspace', () => {
      const relations = getMetadataArgsStorage().relations;
      const workspaceRelation = relations.find(
        (r) => r.target === LunchPost && r.propertyName === 'workspace',
      );

      expect(workspaceRelation).toBeDefined();
      expect(workspaceRelation?.relationType).toBe('many-to-one');
    });

    it('should have ManyToOne relation to author (Member)', () => {
      const relations = getMetadataArgsStorage().relations;
      const authorRelation = relations.find(
        (r) => r.target === LunchPost && r.propertyName === 'author',
      );

      expect(authorRelation).toBeDefined();
      expect(authorRelation?.relationType).toBe('many-to-one');
    });

    it('should have OneToMany relation to participations', () => {
      const relations = getMetadataArgsStorage().relations;
      const participationsRelation = relations.find(
        (r) => r.target === LunchPost && r.propertyName === 'participations',
      );

      expect(participationsRelation).toBeDefined();
      expect(participationsRelation?.relationType).toBe('one-to-many');
    });
  });
});
