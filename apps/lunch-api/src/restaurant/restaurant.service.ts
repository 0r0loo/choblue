import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { MenuItem } from '../entities/menu-item.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findOrCreateRestaurant(
    name: string,
    workspaceId: string,
  ): Promise<Restaurant> {
    const trimmed = name.trim();

    const existing = await this.restaurantRepository.findOne({
      where: { name: trimmed, workspaceId },
    });

    if (existing) return existing;

    const restaurant = this.restaurantRepository.create({
      name: trimmed,
      workspaceId,
    });

    return this.restaurantRepository.save(restaurant);
  }

  async findOrCreateMenuItem(
    name: string,
    restaurantId: string,
  ): Promise<MenuItem> {
    const trimmed = name.trim();

    const existing = await this.menuItemRepository.findOne({
      where: { name: trimmed, restaurantId },
    });

    if (existing) return existing;

    const menuItem = this.menuItemRepository.create({
      name: trimmed,
      restaurantId,
    });

    return this.menuItemRepository.save(menuItem);
  }

  async resolveRestaurantAndMenu(
    restaurantName: string,
    menuName: string,
    workspaceId: string,
  ): Promise<{ restaurant: Restaurant; menuItem: MenuItem }> {
    const restaurant = await this.findOrCreateRestaurant(
      restaurantName,
      workspaceId,
    );
    const menuItem = await this.findOrCreateMenuItem(
      menuName,
      restaurant.id,
    );
    return { restaurant, menuItem };
  }

  async searchRestaurants(
    workspaceId: string,
    query: string,
  ): Promise<Restaurant[]> {
    return this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where('restaurant.workspaceId = :workspaceId', { workspaceId })
      .andWhere('restaurant.name ILIKE :query', { query: `%${query}%` })
      .orderBy('restaurant.name', 'ASC')
      .limit(10)
      .getMany();
  }

  async searchMenuItems(
    restaurantId: string,
    query: string,
  ): Promise<MenuItem[]> {
    return this.menuItemRepository
      .createQueryBuilder('menuItem')
      .where('menuItem.restaurantId = :restaurantId', { restaurantId })
      .andWhere('menuItem.name ILIKE :query', { query: `%${query}%` })
      .orderBy('menuItem.name', 'ASC')
      .limit(10)
      .getMany();
  }

  async getRestaurantStats(workspaceId: string) {
    return this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.reviews', 'review')
      .select('restaurant.id', 'restaurantId')
      .addSelect('restaurant.name', 'restaurantName')
      .addSelect('COUNT(review.id)', 'visitCount')
      .addSelect('ROUND(AVG(review.tasteRating)::numeric, 1)', 'avgTasteRating')
      .addSelect('ROUND(AVG(review.portionRating)::numeric, 1)', 'avgPortionRating')
      .where('restaurant.workspaceId = :workspaceId', { workspaceId })
      .groupBy('restaurant.id')
      .addGroupBy('restaurant.name')
      .orderBy('COUNT(review.id)', 'DESC')
      .getRawMany();
  }
}
