import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Participation } from '../participation.entity';

describe('Participation Entity', () => {
  describe('instance creation', () => {
    it('should create a Participation instance', () => {
      const participation = new Participation();

      expect(participation).toBeInstanceOf(Participation);
    });
  });

  describe('field assignment', () => {
    it('should accept all required fields', () => {
      const participation = new Participation();
      participation.id = '550e8400-e29b-41d4-a716-446655440000';
      participation.lunchPostId = '660e8400-e29b-41d4-a716-446655440000';
      participation.memberId = '770e8400-e29b-41d4-a716-446655440000';

      expect(participation.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(participation.lunchPostId).toBe('660e8400-e29b-41d4-a716-446655440000');
      expect(participation.memberId).toBe('770e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('TypeORM metadata', () => {
    it('should be registered as a TypeORM entity', () => {
      const tables = getMetadataArgsStorage().tables;
      const participationTable = tables.find((t) => t.target === Participation);

      expect(participationTable).toBeDefined();
    });

    it('should have id as primary generated uuid column', () => {
      const generatedColumns = getMetadataArgsStorage().generations;
      const idGeneration = generatedColumns.find(
        (g) => g.target === Participation && g.propertyName === 'id',
      );

      expect(idGeneration).toBeDefined();
      expect(idGeneration?.strategy).toBe('uuid');
    });

    it('should have createdAt timestamp column', () => {
      const columns = getMetadataArgsStorage().columns;
      const createdAt = columns.find(
        (c) => c.target === Participation && c.propertyName === 'createdAt',
      );

      expect(createdAt).toBeDefined();
    });

    it('should have unique constraint on lunchPostId and memberId combination', () => {
      const uniques = getMetadataArgsStorage().uniques;
      const participationUnique = uniques.find(
        (u) => u.target === Participation,
      );

      expect(participationUnique).toBeDefined();
      expect(participationUnique?.columns).toContain('lunchPostId');
      expect(participationUnique?.columns).toContain('memberId');
    });
  });

  describe('relations', () => {
    it('should have ManyToOne relation to lunchPost', () => {
      const relations = getMetadataArgsStorage().relations;
      const lunchPostRelation = relations.find(
        (r) => r.target === Participation && r.propertyName === 'lunchPost',
      );

      expect(lunchPostRelation).toBeDefined();
      expect(lunchPostRelation?.relationType).toBe('many-to-one');
    });

    it('should have ManyToOne relation to member', () => {
      const relations = getMetadataArgsStorage().relations;
      const memberRelation = relations.find(
        (r) => r.target === Participation && r.propertyName === 'member',
      );

      expect(memberRelation).toBeDefined();
      expect(memberRelation?.relationType).toBe('many-to-one');
    });
  });
});
