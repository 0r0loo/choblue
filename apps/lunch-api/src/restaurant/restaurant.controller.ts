import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CookieGuard } from '../auth/cookie.guard';
import { CurrentWorkspace } from '../auth/current-workspace.decorator';
import { Workspace } from '../entities/workspace.entity';

@Controller()
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/restaurants')
  async searchRestaurants(
    @Param('workspaceId') _workspaceId: string,
    @CurrentWorkspace() workspace: Workspace,
    @Query('q') query?: string,
  ) {
    if (!query) return [];
    return this.restaurantService.searchRestaurants(workspace.id, query);
  }

  @UseGuards(CookieGuard)
  @Get('restaurants/:restaurantId/menu-items')
  async searchMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('q') query?: string,
  ) {
    if (!query) return [];
    return this.restaurantService.searchMenuItems(restaurantId, query);
  }

  @UseGuards(CookieGuard)
  @Get('workspaces/:workspaceId/restaurant-stats')
  async getRestaurantStats(
    @Param('workspaceId') _workspaceId: string,
    @CurrentWorkspace() workspace: Workspace,
  ) {
    return this.restaurantService.getRestaurantStats(workspace.id);
  }
}
