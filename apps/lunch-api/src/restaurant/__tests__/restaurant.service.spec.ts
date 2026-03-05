import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RestaurantService } from '../restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Workspace } from '../../entities/workspace.entity';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantRepository: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let menuItemRepository: {
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let mockQueryBuilder: {
    where: ReturnType<typeof vi.fn>;
    andWhere: ReturnType<typeof vi.fn>;
    orderBy: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    getMany: ReturnType<typeof vi.fn>;
    leftJoin: ReturnType<typeof vi.fn>;
    select: ReturnType<typeof vi.fn>;
    addSelect: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    addGroupBy: ReturnType<typeof vi.fn>;
    getRawMany: ReturnType<typeof vi.fn>;
  };

  const mockWorkspace: Workspace = {
    id: 'workspace-uuid-1234',
    name: 'Engineering Team',
    slug: 'engineering-team-a1b2',
    inviteCode: 'invite-code-uuid-v4',
    adminToken: 'admin-token-uuid-v4',
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    members: [],
    lunchPosts: [],
    restaurants: [],
  };

  const mockRestaurant: Restaurant = {
    id: 'restaurant-uuid-1234',
    name: '중화반점',
    workspaceId: 'workspace-uuid-1234',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    workspace: mockWorkspace,
    menuItems: [],
    reviews: [],
  };

  const mockMenuItem: MenuItem = {
    id: 'menu-item-uuid-1234',
    name: '짬뽕',
    restaurantId: 'restaurant-uuid-1234',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    restaurant: mockRestaurant,
    reviews: [],
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      getMany: vi.fn(),
      leftJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      addGroupBy: vi.fn().mockReturnThis(),
      getRawMany: vi.fn(),
    };

    restaurantRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    menuItemRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepository,
        },
        {
          provide: getRepositoryToken(MenuItem),
          useValue: menuItemRepository,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // findOrCreateRestaurant
  // ─────────────────────────────────────────────
  describe('findOrCreateRestaurant', () => {
    it('should return existing restaurant if found', async () => {
      restaurantRepository.findOne.mockResolvedValue(mockRestaurant);

      const result = await service.findOrCreateRestaurant('중화반점', 'workspace-uuid-1234');

      expect(result).toBe(mockRestaurant);
      expect(restaurantRepository.create).not.toHaveBeenCalled();
    });

    it('should create new restaurant if not found', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);
      restaurantRepository.create.mockReturnValue(mockRestaurant);
      restaurantRepository.save.mockResolvedValue(mockRestaurant);

      const result = await service.findOrCreateRestaurant('중화반점', 'workspace-uuid-1234');

      expect(result).toBe(mockRestaurant);
      expect(restaurantRepository.create).toHaveBeenCalledWith({
        name: '중화반점',
        workspaceId: 'workspace-uuid-1234',
      });
      expect(restaurantRepository.save).toHaveBeenCalled();
    });

    it('should trim whitespace from name', async () => {
      restaurantRepository.findOne.mockResolvedValue(null);
      restaurantRepository.create.mockReturnValue(mockRestaurant);
      restaurantRepository.save.mockResolvedValue(mockRestaurant);

      await service.findOrCreateRestaurant('  중화반점  ', 'workspace-uuid-1234');

      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { name: '중화반점', workspaceId: 'workspace-uuid-1234' },
      });
      expect(restaurantRepository.create).toHaveBeenCalledWith({
        name: '중화반점',
        workspaceId: 'workspace-uuid-1234',
      });
    });
  });

  // ─────────────────────────────────────────────
  // findOrCreateMenuItem
  // ─────────────────────────────────────────────
  describe('findOrCreateMenuItem', () => {
    it('should return existing menu item if found', async () => {
      menuItemRepository.findOne.mockResolvedValue(mockMenuItem);

      const result = await service.findOrCreateMenuItem('짬뽕', 'restaurant-uuid-1234');

      expect(result).toBe(mockMenuItem);
      expect(menuItemRepository.create).not.toHaveBeenCalled();
    });

    it('should create new menu item if not found', async () => {
      menuItemRepository.findOne.mockResolvedValue(null);
      menuItemRepository.create.mockReturnValue(mockMenuItem);
      menuItemRepository.save.mockResolvedValue(mockMenuItem);

      const result = await service.findOrCreateMenuItem('짬뽕', 'restaurant-uuid-1234');

      expect(result).toBe(mockMenuItem);
      expect(menuItemRepository.create).toHaveBeenCalledWith({
        name: '짬뽕',
        restaurantId: 'restaurant-uuid-1234',
      });
    });
  });

  // ─────────────────────────────────────────────
  // resolveRestaurantAndMenu
  // ─────────────────────────────────────────────
  describe('resolveRestaurantAndMenu', () => {
    it('should return both restaurant and menu item', async () => {
      restaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      menuItemRepository.findOne.mockResolvedValue(mockMenuItem);

      const result = await service.resolveRestaurantAndMenu(
        '중화반점',
        '짬뽕',
        'workspace-uuid-1234',
      );

      expect(result.restaurant).toBe(mockRestaurant);
      expect(result.menuItem).toBe(mockMenuItem);
    });
  });

  // ─────────────────────────────────────────────
  // searchRestaurants
  // ─────────────────────────────────────────────
  describe('searchRestaurants', () => {
    it('should search with ILIKE and limit 10', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockRestaurant]);

      const result = await service.searchRestaurants('workspace-uuid-1234', '중화');

      expect(result).toHaveLength(1);
      expect(restaurantRepository.createQueryBuilder).toHaveBeenCalledWith('restaurant');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'restaurant.workspaceId = :workspaceId',
        { workspaceId: 'workspace-uuid-1234' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'restaurant.name ILIKE :query',
        { query: '%중화%' },
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });

  // ─────────────────────────────────────────────
  // getRestaurantStats
  // ─────────────────────────────────────────────
  describe('getRestaurantStats', () => {
    it('should return aggregated stats', async () => {
      const stats = [
        { restaurantId: 'r1', restaurantName: '중화반점', visitCount: '5', avgTasteRating: '4.2', avgPortionRating: '3.8' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(stats);

      const result = await service.getRestaurantStats('workspace-uuid-1234');

      expect(result).toHaveLength(1);
      expect(result[0].restaurantName).toBe('중화반점');
      expect(restaurantRepository.createQueryBuilder).toHaveBeenCalledWith('restaurant');
    });
  });
});
