import { queryOptions } from '@tanstack/react-query';
import { api } from './api';
import { postKeys, reviewKeys, workspaceKeys, memberKeys } from './query-keys';
import type {
  LunchPost,
  CalendarPost,
  Review,
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
