import { queryOptions } from '@tanstack/react-query';
import { api } from './api';
import { postKeys, reviewKeys, workspaceKeys, restaurantKeys, memberKeys } from './query-keys';
import type {
  LunchPost,
  CalendarPost,
  Review,
  MenuHistoryItem,
  RestaurantStats,
  Workspace,
  Member,
  CurrentMember,
  WorkspaceInfo,
} from '@/types';

export const postQueries = {
  list: (workspaceId: string, date: string) =>
    queryOptions({
      queryKey: postKeys.list(workspaceId, date),
      queryFn: () =>
        api.get<LunchPost[]>(
          `/workspaces/${workspaceId}/posts?date=${date}`,
        ),
    }),
  detail: (postId: string) =>
    queryOptions({
      queryKey: postKeys.detail(postId),
      queryFn: () => api.get<LunchPost>(`/posts/${postId}`),
    }),
  calendar: (workspaceId: string, month: string) =>
    queryOptions({
      queryKey: postKeys.calendar(workspaceId, month),
      queryFn: () =>
        api.get<Record<string, CalendarPost[]>>(
          `/workspaces/${workspaceId}/posts/calendar?month=${month}`,
        ),
    }),
};

export const reviewQueries = {
  list: (postId: string) =>
    queryOptions({
      queryKey: reviewKeys.list(postId),
      queryFn: () => api.get<Review[]>(`/posts/${postId}/reviews`),
    }),
  workspace: (workspaceId: string) =>
    queryOptions({
      queryKey: reviewKeys.workspace(workspaceId),
      queryFn: () =>
        api.get<Review[]>(`/workspaces/${workspaceId}/reviews`),
    }),
  menuHistory: (
    workspaceId: string,
    filters?: { dateFrom?: string; dateTo?: string; search?: string },
  ) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return queryOptions({
      queryKey: [...reviewKeys.menuHistory(workspaceId), filters] as const,
      queryFn: () =>
        api.get<MenuHistoryItem[]>(
          `/workspaces/${workspaceId}/menu-history${qs ? `?${qs}` : ''}`,
        ),
    });
  },
};

export const restaurantQueries = {
  search: (workspaceId: string, query: string) =>
    queryOptions({
      queryKey: restaurantKeys.search(workspaceId, query),
      queryFn: () =>
        api.get<{ id: string; name: string }[]>(
          `/workspaces/${workspaceId}/restaurants?q=${encodeURIComponent(query)}`,
        ),
      enabled: query.length > 0,
    }),
  stats: (workspaceId: string) =>
    queryOptions({
      queryKey: restaurantKeys.stats(workspaceId),
      queryFn: () =>
        api.get<RestaurantStats[]>(
          `/workspaces/${workspaceId}/restaurant-stats`,
        ),
    }),
};

export const workspaceQueries = {
  detail: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.detail(workspaceId),
      queryFn: async () => {
        const res = await api.get<{ workspace: Workspace; memberCount: number }>(
          `/workspaces/${workspaceId}`,
        );
        return res.workspace;
      },
    }),
  members: (workspaceId: string) =>
    queryOptions({
      queryKey: workspaceKeys.members(workspaceId),
      queryFn: () =>
        api.get<Member[]>(`/workspaces/${workspaceId}/members`),
    }),
  byInviteCode: (code: string) =>
    queryOptions({
      queryKey: workspaceKeys.byInviteCode(code),
      queryFn: () =>
        api.get<WorkspaceInfo>(`/workspaces/by-invite/${code}`),
    }),
};

export const memberQueries = {
  me: () =>
    queryOptions({
      queryKey: memberKeys.me(),
      queryFn: () => api.get<Member>('/members/me'),
    }),
  current: (workspaceSlug: string) =>
    queryOptions({
      queryKey: memberKeys.current(workspaceSlug),
      queryFn: () => api.get<CurrentMember>('/members/me'),
    }),
};
